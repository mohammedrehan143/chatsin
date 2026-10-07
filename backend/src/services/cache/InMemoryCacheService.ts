import { ICacheService } from './ICacheService';

interface CacheEntry {
  value: any;
  expiresAt: number | null;
}

export class InMemoryCacheService implements ICacheService {
  private store: Map<string, CacheEntry> = new Map();
  // userId -> Set<socketId> (clean multi-tab presence tracking)
  private userSockets: Map<string, Set<string>> = new Map();
  // conversationId -> Map<userId, expiresAt>
  private typingMap: Map<string, Map<string, number>> = new Map();
  // Rate limiting: key -> { count, resetAt }
  private rateLimits: Map<string, { count: number; resetAt: number }> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async addUserSocket(userId: string, socketId: string): Promise<void> {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  async removeUserSocket(userId: string, socketId: string): Promise<{ remainingSocketsCount: number; isOffline: boolean }> {
    const sockets = this.userSockets.get(userId);
    if (!sockets) {
      return { remainingSocketsCount: 0, isOffline: true };
    }
    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.userSockets.delete(userId);
      return { remainingSocketsCount: 0, isOffline: true };
    }
    return { remainingSocketsCount: sockets.size, isOffline: false };
  }

  async getUserSocketIds(userId: string): Promise<string[]> {
    const sockets = this.userSockets.get(userId);
    return sockets ? Array.from(sockets) : [];
  }

  async getOnlineUserIds(): Promise<string[]> {
    return Array.from(this.userSockets.keys());
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const sockets = this.userSockets.get(userId);
    return !!sockets && sockets.size > 0;
  }

  async setUserTyping(conversationId: string, userId: string, ttlSeconds = 3): Promise<void> {
    if (!this.typingMap.has(conversationId)) {
      this.typingMap.set(conversationId, new Map());
    }
    const convTyping = this.typingMap.get(conversationId)!;
    convTyping.set(userId, Date.now() + ttlSeconds * 1000);
  }

  async removeUserTyping(conversationId: string, userId: string): Promise<void> {
    const convTyping = this.typingMap.get(conversationId);
    if (convTyping) {
      convTyping.delete(userId);
      if (convTyping.size === 0) {
        this.typingMap.delete(conversationId);
      }
    }
  }

  async getTypingUsers(conversationId: string): Promise<string[]> {
    const convTyping = this.typingMap.get(conversationId);
    if (!convTyping) return [];

    const now = Date.now();
    const active: string[] = [];
    for (const [userId, expiresAt] of convTyping.entries()) {
      if (now < expiresAt) {
        active.push(userId);
      } else {
        convTyping.delete(userId);
      }
    }
    return active;
  }

  async checkRateLimit(key: string, maxHits: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();
    const entry = this.rateLimits.get(key);

    if (!entry || now > entry.resetAt) {
      this.rateLimits.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
      return { allowed: true, remaining: maxHits - 1 };
    }

    if (entry.count < maxHits) {
      entry.count += 1;
      return { allowed: true, remaining: maxHits - entry.count };
    }

    return { allowed: false, remaining: 0 };
  }

  async setTempState(conversationId: string, stateKey: string, value: any, ttlSeconds = 300): Promise<void> {
    await this.set(`temp:${conversationId}:${stateKey}`, value, ttlSeconds);
  }

  async getTempState<T>(conversationId: string, stateKey: string): Promise<T | null> {
    return this.get<T>(`temp:${conversationId}:${stateKey}`);
  }
}

export const inMemoryCacheService = new InMemoryCacheService();
