import { Conversation, ConversationMember, User } from '../types';
import { getPrismaClient, isDatabaseConnected } from '../services/database';
import { memoryStore } from '../services/database/memoryStore';
import crypto from 'crypto';

export interface IConversationRepository {
  findById(id: string): Promise<Conversation | null>;
  findDirectConversation(userAId: string, userBId: string): Promise<Conversation | null>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  createDirect(userAId: string, userBId: string): Promise<Conversation>;
  isMember(conversationId: string, userId: string): Promise<boolean>;
  getMembers(conversationId: string): Promise<ConversationMember[]>;
}

export class ConversationRepository implements IConversationRepository {
  async findById(id: string): Promise<Conversation | null> {
    if (isDatabaseConnected()) {
      try {
        const conv = await getPrismaClient().conversation.findUnique({
          where: { id },
          include: {
            members: {
              include: { user: true }
            }
          }
        });
        return conv as any;
      } catch (err) {
        console.warn('[ConversationRepository] Prisma findById error', err);
      }
    }

    const c = memoryStore.conversations.get(id);
    if (!c) return null;

    const members = memoryStore.conversationMembers
      .filter(m => m.conversationId === id)
      .map(m => ({
        ...m,
        user: memoryStore.users.get(m.userId)
      }));

    return {
      ...c,
      members
    };
  }

  async findDirectConversation(userAId: string, userBId: string): Promise<Conversation | null> {
    if (isDatabaseConnected()) {
      try {
        const conv = await getPrismaClient().conversation.findFirst({
          where: {
            isGroup: false,
            AND: [
              { members: { some: { userId: userAId } } },
              { members: { some: { userId: userBId } } }
            ]
          },
          include: {
            members: {
              include: { user: true }
            }
          }
        });
        return conv as any;
      } catch (err) {
        console.warn('[ConversationRepository] Prisma findDirect error', err);
      }
    }

    for (const c of memoryStore.conversations.values()) {
      if (c.isGroup) continue;
      const mems = memoryStore.conversationMembers.filter(m => m.conversationId === c.id);
      const userIds = mems.map(m => m.userId);
      if (userIds.includes(userAId) && userIds.includes(userBId) && userIds.length === 2) {
        return {
          ...c,
          members: mems.map(m => ({
            ...m,
            user: memoryStore.users.get(m.userId)
          }))
        };
      }
    }
    return null;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    if (isDatabaseConnected()) {
      try {
        const convs = await getPrismaClient().conversation.findMany({
          where: {
            members: { some: { userId } }
          },
          include: {
            members: {
              include: { user: true }
            },
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { updatedAt: 'desc' }
        });

        return convs.map(c => ({
          ...c,
          lastMessage: c.messages[0] || null
        })) as any;
      } catch (err) {
        console.warn('[ConversationRepository] Prisma getUserConversations error', err);
      }
    }

    const memberConvs = memoryStore.conversationMembers.filter(m => m.userId === userId);
    const list: Conversation[] = [];

    for (const m of memberConvs) {
      const c = memoryStore.conversations.get(m.conversationId);
      if (!c) continue;

      const members = memoryStore.conversationMembers
        .filter(cm => cm.conversationId === c.id)
        .map(cm => ({
          ...cm,
          user: memoryStore.users.get(cm.userId)
        }));

      // Find last message
      const msgs = Array.from(memoryStore.messages.values())
        .filter(msg => msg.conversationId === c.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Unread count
      const unreadCount = msgs.filter(msg => {
        if (msg.senderId === userId) return false;
        const read = memoryStore.messageReads.some(r => r.messageId === msg.id && r.userId === userId);
        return !read;
      }).length;

      list.push({
        ...c,
        members,
        lastMessage: msgs[0] || null,
        unreadCount
      });
    }

    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async createDirect(userAId: string, userBId: string): Promise<Conversation> {
    if (isDatabaseConnected()) {
      try {
        const created = await getPrismaClient().conversation.create({
          data: {
            isGroup: false,
            members: {
              create: [
                { userId: userAId },
                { userId: userBId }
              ]
            }
          },
          include: {
            members: {
              include: { user: true }
            }
          }
        });
        return created as any;
      } catch (err) {
        console.warn('[ConversationRepository] Prisma createDirect error', err);
      }
    }

    const convId = crypto.randomUUID();
    const newConv: Conversation = {
      id: convId,
      isGroup: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.conversations.set(convId, newConv);

    const memA: ConversationMember = { conversationId: convId, userId: userAId, joinedAt: new Date() };
    const memB: ConversationMember = { conversationId: convId, userId: userBId, joinedAt: new Date() };
    memoryStore.conversationMembers.push(memA, memB);

    return {
      ...newConv,
      members: [
        { ...memA, user: memoryStore.users.get(userAId) },
        { ...memB, user: memoryStore.users.get(userBId) }
      ]
    };
  }

  async isMember(conversationId: string, userId: string): Promise<boolean> {
    if (isDatabaseConnected()) {
      try {
        const member = await getPrismaClient().conversationMember.findUnique({
          where: {
            conversationId_userId: { conversationId, userId }
          }
        });
        return !!member;
      } catch (err) {
        console.warn('[ConversationRepository] Prisma isMember error', err);
      }
    }

    return memoryStore.conversationMembers.some(
      m => m.conversationId === conversationId && m.userId === userId
    );
  }

  async getMembers(conversationId: string): Promise<ConversationMember[]> {
    if (isDatabaseConnected()) {
      try {
        const members = await getPrismaClient().conversationMember.findMany({
          where: { conversationId },
          include: { user: true }
        });
        return members as any;
      } catch (err) {
        console.warn('[ConversationRepository] Prisma getMembers error', err);
      }
    }

    return memoryStore.conversationMembers
      .filter(m => m.conversationId === conversationId)
      .map(m => ({
        ...m,
        user: memoryStore.users.get(m.userId)
      }));
  }
}

export const conversationRepository = new ConversationRepository();
