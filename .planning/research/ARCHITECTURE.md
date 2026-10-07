# Real-Time Chat Architecture Research

## 1. Decoupled Architecture Patterns

### Frontend & Backend Separation
- **Independent Ports**: Frontend on port 3000 (Next.js), Backend on port 5000 (Express/Socket.IO).
- **Communication Protocols**:
  - **HTTP REST**: Stateless operations (auth, user queries, historical message paging, profile updates).
  - **WebSockets (Socket.IO)**: Stateful bidirectional push (new messages, typing debounce bursts, presence broadcasts, read receipt confirmations).
- **CORS & Transports**:
  - Express CORS must explicitly whitelist `http://localhost:3000` with `credentials: true`.
  - Socket.IO server must configure CORS origin and allow transports `['websocket', 'polling']`.

## 2. Layered Backend Design

```
Controllers (Thin, request parsing & response serialization)
      │
      ▼
Services (Business logic orchestration)
      ├───────────────┬────────────────┬────────────────┐
      ▼               ▼                ▼                ▼
Repositories    Cache Service    Event Service    WebSocket Gateway
 (Prisma/DB)     (Valkey/Memory)  (Kafka/Emitter)  (Socket.IO Push)
```

### Abstraction Interfaces
1. **ICacheService**:
   - `get<T>(key: string): Promise<T | null>`
   - `set(key: string, value: any, ttlSeconds?: number): Promise<void>`
   - `del(key: string): Promise<void>`
   - `addUserOnline(userId: string, socketId: string): Promise<void>`
   - `removeUserSocket(userId: string, socketId: string): Promise<boolean>` (returns true if 0 sockets remain)
   - `getOnlineUserIds(): Promise<string[]>`
   - `setUserTyping(conversationId: string, userId: string, ttlSeconds: number): Promise<void>`

2. **IEventPublisher**:
   - `publish<T>(eventType: string, payload: T): Promise<void>`
   - Events: `message_sent`, `message_read`, `user_online`, `user_offline`, `user_registered`.
   - Local driver: Uses Node `EventEmitter` or logging no-op.
   - Future driver: Connects `KafkaJS` to Aiven Kafka topic cluster.

## 3. Database & Schema Design

- **User**: `id`, `email`, `username`, `passwordHash`, `avatarUrl`, `createdAt`, `updatedAt`
- **Session**: `id`, `userId`, `token`, `expiresAt`, `createdAt`
- **Conversation**: `id`, `isGroup` (default false), `createdAt`, `updatedAt`
- **ConversationMember**: `conversationId`, `userId`, `joinedAt` (Composite primary key)
- **Message**: `id`, `conversationId`, `senderId`, `content`, `status` (`SENT`, `DELIVERED`, `READ`), `createdAt`, `updatedAt`
- **MessageRead**: `messageId`, `userId`, `readAt` (Composite primary key)
