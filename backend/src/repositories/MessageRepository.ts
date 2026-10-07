import { Message, MessageStatus } from '../types';
import { getPrismaClient, isDatabaseConnected } from '../services/database';
import { memoryStore } from '../services/database/memoryStore';
import crypto from 'crypto';

export interface IMessageRepository {
  findById(id: string): Promise<Message | null>;
  create(data: { conversationId: string; senderId: string; content: string }): Promise<Message>;
  getByConversation(conversationId: string, limit?: number, before?: Date | string): Promise<Message[]>;
  updateStatus(id: string, status: MessageStatus): Promise<Message | null>;
  markAsRead(messageId: string, userId: string): Promise<void>;
  markConversationAsRead(conversationId: string, userId: string): Promise<string[]>;
}

export class MessageRepository implements IMessageRepository {
  async findById(id: string): Promise<Message | null> {
    if (isDatabaseConnected()) {
      try {
        const msg = await getPrismaClient().message.findUnique({
          where: { id },
          include: { sender: true }
        });
        return msg as any;
      } catch (err) {
        console.warn('[MessageRepository] Prisma findById error', err);
      }
    }

    const m = memoryStore.messages.get(id);
    if (!m) return null;
    return {
      ...m,
      sender: memoryStore.users.get(m.senderId)
    };
  }

  async create(data: { conversationId: string; senderId: string; content: string }): Promise<Message> {
    if (isDatabaseConnected()) {
      try {
        const created = await getPrismaClient().message.create({
          data: {
            conversationId: data.conversationId,
            senderId: data.senderId,
            content: data.content,
            status: 'SENT'
          },
          include: { sender: true }
        });
        // Also update conversation updatedAt
        await getPrismaClient().conversation.update({
          where: { id: data.conversationId },
          data: { updatedAt: new Date() }
        });
        return created as any;
      } catch (err) {
        console.warn('[MessageRepository] Prisma create error', err);
      }
    }

    const msgId = crypto.randomUUID();
    const newMsg: Message = {
      id: msgId,
      conversationId: data.conversationId,
      senderId: data.senderId,
      content: data.content,
      status: 'SENT',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.messages.set(msgId, newMsg);

    const conv = memoryStore.conversations.get(data.conversationId);
    if (conv) {
      conv.updatedAt = new Date();
    }

    return {
      ...newMsg,
      sender: memoryStore.users.get(data.senderId)
    };
  }

  async getByConversation(conversationId: string, limit = 50, before?: Date | string): Promise<Message[]> {
    if (isDatabaseConnected()) {
      try {
        const msgs = await getPrismaClient().message.findMany({
          where: {
            conversationId,
            ...(before ? { createdAt: { lt: new Date(before) } } : {})
          },
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { sender: true }
        });
        return msgs.reverse() as any;
      } catch (err) {
        console.warn('[MessageRepository] Prisma getByConversation error', err);
      }
    }

    const beforeTime = before ? new Date(before).getTime() : Infinity;
    const msgs = Array.from(memoryStore.messages.values())
      .filter(m => m.conversationId === conversationId && new Date(m.createdAt).getTime() < beforeTime)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(m => ({
        ...m,
        sender: memoryStore.users.get(m.senderId)
      }))
      .reverse();

    return msgs;
  }

  async updateStatus(id: string, status: MessageStatus): Promise<Message | null> {
    if (isDatabaseConnected()) {
      try {
        const updated = await getPrismaClient().message.update({
          where: { id },
          data: { status },
          include: { sender: true }
        });
        return updated as any;
      } catch (err) {
        console.warn('[MessageRepository] Prisma updateStatus error', err);
      }
    }

    const existing = memoryStore.messages.get(id);
    if (!existing) return null;
    const updated = { ...existing, status, updatedAt: new Date() };
    memoryStore.messages.set(id, updated);
    return {
      ...updated,
      sender: memoryStore.users.get(updated.senderId)
    };
  }

  async markAsRead(messageId: string, userId: string): Promise<void> {
    if (isDatabaseConnected()) {
      try {
        await getPrismaClient().messageRead.upsert({
          where: {
            messageId_userId: { messageId, userId }
          },
          update: { readAt: new Date() },
          create: { messageId, userId, readAt: new Date() }
        });
        await getPrismaClient().message.update({
          where: { id: messageId },
          data: { status: 'READ' }
        });
        return;
      } catch (err) {
        console.warn('[MessageRepository] Prisma markAsRead error', err);
      }
    }

    const exists = memoryStore.messageReads.some(r => r.messageId === messageId && r.userId === userId);
    if (!exists) {
      memoryStore.messageReads.push({ messageId, userId, readAt: new Date() });
    }
    const msg = memoryStore.messages.get(messageId);
    if (msg) {
      msg.status = 'READ';
      msg.updatedAt = new Date();
    }
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<string[]> {
    const updatedMessageIds: string[] = [];

    if (isDatabaseConnected()) {
      try {
        const unreadMsgs = await getPrismaClient().message.findMany({
          where: {
            conversationId,
            senderId: { not: userId },
            status: { not: 'READ' }
          },
          select: { id: true }
        });

        for (const msg of unreadMsgs) {
          await this.markAsRead(msg.id, userId);
          updatedMessageIds.push(msg.id);
        }
        return updatedMessageIds;
      } catch (err) {
        console.warn('[MessageRepository] Prisma markConversationAsRead error', err);
      }
    }

    const unread = Array.from(memoryStore.messages.values()).filter(
      m => m.conversationId === conversationId && m.senderId !== userId && m.status !== 'READ'
    );

    for (const msg of unread) {
      await this.markAsRead(msg.id, userId);
      updatedMessageIds.push(msg.id);
    }

    return updatedMessageIds;
  }
}

export const messageRepository = new MessageRepository();
