export interface ICacheService {
  // Generic key-value store with TTL
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;

  // User presence & socket mapping (multi-tab support)
  addUserSocket(userId: string, socketId: string): Promise<void>;
  removeUserSocket(userId: string, socketId: string): Promise<{ remainingSocketsCount: number; isOffline: boolean }>;
  getUserSocketIds(userId: string): Promise<string[]>;
  getOnlineUserIds(): Promise<string[]>;
  isUserOnline(userId: string): Promise<boolean>;

  // Ephemeral typing indicators
  setUserTyping(conversationId: string, userId: string, ttlSeconds?: number): Promise<void>;
  removeUserTyping(conversationId: string, userId: string): Promise<void>;
  getTypingUsers(conversationId: string): Promise<string[]>;

  // Rate limiting token bucket / hit counter
  checkRateLimit(key: string, maxHits: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number }>;

  // Temporary chat state
  setTempState(conversationId: string, stateKey: string, value: any, ttlSeconds?: number): Promise<void>;
  getTempState<T>(conversationId: string, stateKey: string): Promise<T | null>;
}
