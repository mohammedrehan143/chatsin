import { Session } from '../types';
import { getPrismaClient, isDatabaseConnected } from '../services/database';
import { memoryStore } from '../services/database/memoryStore';
import crypto from 'crypto';

export interface ISessionRepository {
  create(userId: string, token: string, expiresAt: Date): Promise<Session>;
  findByToken(token: string): Promise<Session | null>;
  deleteByToken(token: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}

export class SessionRepository implements ISessionRepository {
  async create(userId: string, token: string, expiresAt: Date): Promise<Session> {
    if (isDatabaseConnected()) {
      try {
        const s = await getPrismaClient().session.create({
          data: { userId, token, expiresAt }
        });
        return s as Session;
      } catch (err) {
        console.warn('[SessionRepository] Prisma create error', err);
      }
    }

    const newSession: Session = {
      id: crypto.randomUUID(),
      userId,
      token,
      expiresAt,
      createdAt: new Date()
    };
    memoryStore.sessions.set(token, newSession);
    return newSession;
  }

  async findByToken(token: string): Promise<Session | null> {
    if (isDatabaseConnected()) {
      try {
        const s = await getPrismaClient().session.findUnique({
          where: { token }
        });
        return s as Session | null;
      } catch (err) {
        console.warn('[SessionRepository] Prisma findByToken error', err);
      }
    }

    return memoryStore.sessions.get(token) || null;
  }

  async deleteByToken(token: string): Promise<void> {
    if (isDatabaseConnected()) {
      try {
        await getPrismaClient().session.deleteMany({
          where: { token }
        });
        return;
      } catch (err) {
        console.warn('[SessionRepository] Prisma deleteByToken error', err);
      }
    }

    memoryStore.sessions.delete(token);
  }

  async deleteByUserId(userId: string): Promise<void> {
    if (isDatabaseConnected()) {
      try {
        await getPrismaClient().session.deleteMany({
          where: { userId }
        });
        return;
      } catch (err) {
        console.warn('[SessionRepository] Prisma deleteByUserId error', err);
      }
    }

    for (const [token, session] of memoryStore.sessions.entries()) {
      if (session.userId === userId) {
        memoryStore.sessions.delete(token);
      }
    }
  }
}

export const sessionRepository = new SessionRepository();
