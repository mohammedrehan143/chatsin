import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { authService } from '../services/auth/authService';
import { userRepository } from '../repositories/UserRepository';
import { conversationRepository } from '../repositories/ConversationRepository';
import { chatService } from '../services/chat/chatService';
import { cacheService } from '../services/cache';
import { eventPublisher } from '../services/events';
import { config } from '../config';
import { User } from '../types';

interface AuthenticatedSocket extends Socket {
  user?: Omit<User, 'passwordHash'>;
}

let ioInstance: Server | null = null;

export function getIO(): Server | null {
  return ioInstance;
}

export function notifyNewConversation(recipientId: string, conversation: any): void {
  if (ioInstance) {
    ioInstance.to(`user:${recipientId}`).emit('new_conversation', conversation);
  }
}

export function broadcastMessage(conversationId: string, message: any, sender: any): void {
  if (!ioInstance) return;
  const payload = {
    message: {
      ...message,
      sender
    }
  };
  ioInstance.to(`conversation:${conversationId}`).emit('new_message', payload);
  conversationRepository.getMembers(conversationId).then(members => {
    for (const m of members) {
      ioInstance!.to(`user:${m.userId}`).emit('new_message', payload);
      ioInstance!.to(`user:${m.userId}`).emit('conversation_updated', {
        conversationId,
        lastMessage: message
      });
    }
  }).catch(() => {});
}

export function initializeWebSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const configuredOrigins = config.frontendUrl.split(',').map((u) => u.trim());
        if (
          configuredOrigins.includes(origin) ||
          origin.endsWith('.vercel.app') ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1')
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  ioInstance = io;

  // 1. Authenticate WebSocket Connection Handshake
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const payload = authService.verifyToken(token);
      const user = await userRepository.findById(payload.userId);
      if (!user) {
        return next(new Error('User not found'));
      }

      const { passwordHash: _, ...safeUser } = user;
      socket.user = safeUser;
      next();
    } catch (err: any) {
      next(new Error(`Authentication failed: ${err.message}`));
    }
  });

  // Connection Lifecycle
  io.on('connection', async (socket: AuthenticatedSocket) => {
    const user = socket.user!;
    const userId = user.id;

    console.log(`[Socket.IO] User connected: ${user.username} (${userId}) - Socket: ${socket.id}`);

    // 2. Register socket & Update Presence in Cache Abstraction
    await cacheService.addUserSocket(userId, socket.id);
    await userRepository.update(userId, { lastSeen: new Date() });

    // Join user's personal room for direct notification push
    socket.join(`user:${userId}`);

    // Automatically join all existing conversations
    try {
      const userConversations = await conversationRepository.getUserConversations(userId);
      for (const conv of userConversations) {
        socket.join(`conversation:${conv.id}`);
      }
    } catch (err) {
      console.warn('[Socket.IO] Error auto-joining conversation rooms:', err);
    }

    // 3. Broadcast online status & publish event
    io.emit('user_status_changed', { userId, isOnline: true });
    await eventPublisher.publish('user_online', { userId, username: user.username });

    // 4. Client Explicit Join Conversation Room
    socket.on('join_conversation', async ({ conversationId }: { conversationId: string }) => {
      const isMember = await conversationRepository.isMember(conversationId, userId);
      if (isMember) {
        socket.join(`conversation:${conversationId}`);
        console.log(`[Socket.IO] ${user.username} joined room conversation:${conversationId}`);
      }
    });

    // 5. Send Message Event via WebSocket
    socket.on('send_message', async (data: { conversationId: string; content: string; clientTempId?: string }) => {
      try {
        const { conversationId, content, clientTempId } = data;
        const message = await chatService.sendMessage(userId, conversationId, content);

        const messagePayload = {
          message: {
            ...message,
            sender: user
          },
          clientTempId
        };

        // Deliver message to conversation room
        io.to(`conversation:${conversationId}`).emit('new_message', messagePayload);

        // Also push to each member's personal user room so their dashboard updates instantly even if not in conversation room
        const members = await conversationRepository.getMembers(conversationId);
        for (const member of members) {
          io.to(`user:${member.userId}`).emit('new_message', {
            ...messagePayload,
            clientTempId: member.userId === userId ? clientTempId : undefined
          });
          io.to(`user:${member.userId}`).emit('conversation_updated', {
            conversationId,
            lastMessage: message
          });
        }
      } catch (err: any) {
        socket.emit('error', { message: err.message, code: err.code || 'SEND_ERROR' });
      }
    });

    // 6. Typing Indicators (with Cache Abstraction)
    socket.on('typing_start', async ({ conversationId }: { conversationId: string }) => {
      const isMember = await conversationRepository.isMember(conversationId, userId);
      if (!isMember) return;

      await cacheService.setUserTyping(conversationId, userId, 3);
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        username: user.username
      });
    });

    socket.on('typing_stop', async ({ conversationId }: { conversationId: string }) => {
      await cacheService.removeUserTyping(conversationId, userId);
      socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
        conversationId,
        userId,
        username: user.username
      });
    });

    // 7. Message Read Receipts
    socket.on('mark_read', async ({ conversationId }: { conversationId: string }) => {
      try {
        const readMessageIds = await chatService.markConversationRead(conversationId, userId);
        if (readMessageIds.length > 0) {
          io.to(`conversation:${conversationId}`).emit('messages_read', {
            conversationId,
            readerId: userId,
            messageIds: readMessageIds
          });
        }
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    // 8. Disconnect Lifecycle
    socket.on('disconnect', async () => {
      console.log(`[Socket.IO] User disconnected socket: ${user.username} - Socket: ${socket.id}`);
      const { isOffline } = await cacheService.removeUserSocket(userId, socket.id);

      // Only mark and broadcast offline if user has NO other active sockets (multi-tab safe)
      if (isOffline) {
        await userRepository.update(userId, { lastSeen: new Date() });
        io.emit('user_status_changed', { userId, isOnline: false, lastSeen: new Date() });
        await eventPublisher.publish('user_offline', { userId, username: user.username });
        console.log(`[Socket.IO] User is now fully offline: ${user.username}`);
      }
    });
  });

  return io;
}
