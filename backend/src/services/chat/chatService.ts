import { conversationRepository, IConversationRepository } from '../../repositories/ConversationRepository';
import { messageRepository, IMessageRepository } from '../../repositories/MessageRepository';
import { userRepository, IUserRepository } from '../../repositories/UserRepository';
import { cacheService } from '../cache';
import { eventPublisher } from '../events';
import { AppError } from '../../utils/response';
import { Conversation, Message } from '../../types';

export class ChatService {
  constructor(
    private convRepo: IConversationRepository = conversationRepository,
    private msgRepo: IMessageRepository = messageRepository,
    private userRepo: IUserRepository = userRepository
  ) {}

  async getUserConversations(userId: string): Promise<any[]> {
    const rawConvs = await this.convRepo.getUserConversations(userId);

    const enriched = await Promise.all(
      rawConvs.map(async conv => {
        // Identify the other participant in 1-to-1 conversation
        const otherMember = conv.members?.find(m => m.userId !== userId);
        const otherUser = otherMember?.user;
        const isOnline = otherUser ? await cacheService.isUserOnline(otherUser.id) : false;

        return {
          id: conv.id,
          isGroup: conv.isGroup,
          updatedAt: conv.updatedAt,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount || 0,
          participant: otherUser
            ? {
                id: otherUser.id,
                username: otherUser.username,
                email: otherUser.email,
                avatarUrl: otherUser.avatarUrl,
                bio: otherUser.bio,
                isOnline,
                lastSeen: otherUser.lastSeen
              }
            : null
        };
      })
    );

    return enriched;
  }

  async getOrCreateDirectConversation(userAId: string, userBId: string): Promise<Conversation> {
    if (userAId === userBId) {
      throw new AppError('Cannot start a conversation with yourself', 400, 'SELF_CONVERSATION_FORBIDDEN');
    }

    const recipient = await this.userRepo.findById(userBId);
    if (!recipient) {
      throw new AppError('Recipient user not found', 404, 'USER_NOT_FOUND');
    }

    const existing = await this.convRepo.findDirectConversation(userAId, userBId);
    if (existing) {
      return existing;
    }

    return this.convRepo.createDirect(userAId, userBId);
  }

  async getConversationMessages(conversationId: string, userId: string, limit = 50, before?: string): Promise<Message[]> {
    const isMember = await this.convRepo.isMember(conversationId, userId);
    if (!isMember) {
      throw new AppError('You are not a member of this conversation', 403, 'FORBIDDEN');
    }

    return this.msgRepo.getByConversation(conversationId, limit, before);
  }

  async sendMessage(senderId: string, conversationId: string, content: string): Promise<Message> {
    const trimmed = content.trim();
    if (!trimmed) {
      throw new AppError('Message content cannot be empty', 400, 'EMPTY_MESSAGE');
    }
    if (trimmed.length > 4000) {
      throw new AppError('Message exceeds maximum length of 4000 characters', 400, 'MESSAGE_TOO_LONG');
    }

    const isMember = await this.convRepo.isMember(conversationId, senderId);
    if (!isMember) {
      throw new AppError('You are not a member of this conversation', 403, 'FORBIDDEN');
    }

    const message = await this.msgRepo.create({
      conversationId,
      senderId,
      content: trimmed
    });

    // Publish event
    await eventPublisher.publish('message_sent', {
      messageId: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      createdAt: message.createdAt
    });

    return message;
  }

  async markConversationRead(conversationId: string, userId: string): Promise<string[]> {
    const isMember = await this.convRepo.isMember(conversationId, userId);
    if (!isMember) {
      throw new AppError('You are not a member of this conversation', 403, 'FORBIDDEN');
    }

    const readMessageIds = await this.msgRepo.markConversationAsRead(conversationId, userId);

    if (readMessageIds.length > 0) {
      await eventPublisher.publish('message_read', {
        conversationId,
        userId,
        messageIds: readMessageIds
      });
    }

    return readMessageIds;
  }
  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    const isMember = await this.convRepo.isMember(conversationId, userId);
    if (!isMember) {
      throw new AppError('You are not a member of this conversation', 403, 'FORBIDDEN');
    }
    await this.convRepo.deleteForUser(conversationId, userId);
  }
}

export const chatService = new ChatService();
