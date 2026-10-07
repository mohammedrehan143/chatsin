# Production Real-Time Chat Application

A high-performance, production-quality real-time messaging application built with a decoupled architecture:
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Socket.IO Client
- **Backend**: Node.js, Express, TypeScript, Socket.IO, Prisma ORM, PostgreSQL
- **Prepared Abstractions**: Isolated interfaces for future cloud-scale caching with **Aiven Valkey** and event streaming with **Aiven Kafka**.

---

## Project Structure

```
chat-app/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with Auth & Chat providers
│   │   ├── page.tsx               # Main chat application (3-pane responsive desktop & mobile)
│   │   ├── login/page.tsx         # User authentication login screen
│   │   ├── register/page.tsx      # User registration signup screen
│   │   └── globals.css            # Tailwind directives and custom scrollbar theme
│   ├── components/
│   │   ├── chat/
│   │   │   ├── Sidebar.tsx        # Conversation list, search trigger, user info & logout
│   │   │   ├── ChatWindow.tsx     # Active conversation header, messages, input & presence
│   │   │   ├── MessageBubble.tsx  # Message item with delivery (Sent/Delivered/Read) checkmarks
│   │   │   ├── MessageInput.tsx   # Auto-grow input with 1.5s typing debounce
│   │   │   ├── TypingIndicator.tsx# Ephemeral animated typing banner
│   │   │   ├── UserSearchModal.tsx# Real-time contact discovery and conversation initiation
│   │   │   └── UserProfilePanel.tsx # 3rd-pane user details drawer with bio editor
│   │   └── ui/
│   │       ├── Avatar.tsx         # Avatar image with fallback initials
│   │       └── StatusDot.tsx      # Real-time online/offline presence indicator
│   ├── context/
│   │   ├── AuthContext.tsx        # Session state, JWT storage, login/logout lifecycle
│   │   └── ChatContext.tsx        # Socket listeners, conversations, messages, optimistic UI
│   ├── lib/
│   │   ├── api.ts                 # Typed HTTP client wrapper with Bearer token injection
│   │   └── socket.ts              # Socket.IO connection manager with reconnect logic
│   ├── types/index.ts             # Shared frontend TypeScript interfaces
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── next.config.mjs
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── config/index.ts        # Typed environment configuration loader
│   │   ├── controllers/
│   │   │   ├── authController.ts  # Register, login, logout, getMe
│   │   │   ├── userController.ts  # User discovery search, profile lookup & update
│   │   │   └── conversationController.ts # Conversations, paginated messages, read marks
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT Bearer token authentication guard
│   │   │   └── errorHandler.ts    # Centralized error handler with standard JSON envelope
│   │   ├── routes/
│   │   │   ├── authRoutes.ts      # /api/auth
│   │   │   ├── userRoutes.ts      # /api/users
│   │   │   └── conversationRoutes.ts # /api/conversations
│   │   ├── services/
│   │   │   ├── auth/authService.ts# Password hashing (bcrypt) and JWT issuance
│   │   │   ├── chat/chatService.ts# Business logic for conversations and message delivery
│   │   │   ├── database/index.ts  # Database connection manager with memory fallback
│   │   │   ├── cache/             # ICacheService abstraction (Aiven Valkey ready)
│   │   │   │   ├── ICacheService.ts
│   │   │   │   ├── InMemoryCacheService.ts
│   │   │   │   └── index.ts
│   │   │   └── events/            # IEventPublisher abstraction (Aiven Kafka ready)
│   │   │       ├── IEventPublisher.ts
│   │   │       ├── LocalEventPublisher.ts
│   │   │       └── index.ts
│   │   ├── websocket/index.ts     # Socket.IO gateway, JWT handshake auth & presence
│   │   ├── repositories/          # Isolated data access layer
│   │   │   ├── UserRepository.ts
│   │   │   ├── ConversationRepository.ts
│   │   │   ├── MessageRepository.ts
│   │   │   ├── SessionRepository.ts
│   │   │   └── index.ts
│   │   ├── types/index.ts         # Core domain types and API envelope types
│   │   ├── utils/response.ts      # Standardized { success, data/error } helper functions
│   │   ├── scripts/verify-e2e.ts  # Automated 13-point multi-user integration test
│   │   └── server.ts              # Express HTTP & Socket.IO initialization
│   ├── prisma/
│   │   └── schema.prisma          # PostgreSQL relational schema
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── .env
│
├── docker-compose.yml             # Local PostgreSQL service container
├── .gitignore
├── README.md
└── .env.example
```

---

## How to Run the Application

The frontend and backend run as completely independent processes on separate ports.

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The backend server will start on:
- **REST API**: `http://localhost:5000`
- **WebSockets**: `ws://localhost:5000` (or `http://localhost:5000/socket.io/`)

*(Optional: Run local PostgreSQL via Docker Compose:)*
```bash
# In project root
docker compose up -d
cd backend
npx prisma db push
```

### 2. Start the Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open your browser to:
- **`http://localhost:3000`**

---

## Automated Validation Test Suite

Run the full end-to-end multi-user automated verification test:

```bash
cd backend
npm run test:e2e
```

This autonomously verifies:
1. Server startup & port binding
2. Registration of two test users (Alice & Bob)
3. Credential validation & JWT generation
4. User search endpoint
5. 1-to-1 conversation establishment
6. WebSocket JWT handshake authentication
7. Multi-client online presence tracking
8. Real-time typing indicators
9. Instant real-time message delivery over WebSocket
10. Read receipt synchronization
11. Database message persistence
12. Multi-tab-safe socket disconnection & offline status broadcast

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend listening port | `5000` |
| `NODE_ENV` | Application environment | `development` |
| `FRONTEND_URL` | Allowed CORS frontend origin | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/chatapp?schema=public` |
| `JWT_SECRET` | Secret key for signing authentication tokens | Min 32 characters |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |
| `VALKEY_HOST` | Aiven Valkey host placeholder | `localhost` |
| `VALKEY_PORT` | Aiven Valkey port placeholder | `6379` |
| `VALKEY_USERNAME` | Aiven Valkey username placeholder | `default` |
| `VALKEY_PASSWORD` | Aiven Valkey password placeholder | *(empty)* |
| `KAFKA_BROKER` | Aiven Kafka broker URI placeholder | `localhost:9092` |
| `KAFKA_USERNAME` | Aiven Kafka username placeholder | *(empty)* |
| `KAFKA_PASSWORD` | Aiven Kafka password placeholder | *(empty)* |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend REST API base URL | `http://localhost:5000` |
| `NEXT_PUBLIC_WS_URL` | Backend WebSocket base URL | `http://localhost:5000` |

---

## REST API Documentation

All responses are wrapped in a standard JSON envelope:

**Success**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Error**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable explanation"
  }
}
```

### Authentication Endpoints
- `POST /api/auth/register` — Create a new user (`email`, `username`, `password`).
- `POST /api/auth/login` — Sign in (`emailOrUsername`, `password`). Returns JWT token.
- `POST /api/auth/logout` — Invalidate session (requires `Authorization: Bearer <token>`).
- `GET /api/auth/me` — Retrieve currently logged-in user profile.

### User Endpoints
- `GET /api/users?q=<search>` — Search registered users by username or email.
- `GET /api/users/:id` — Retrieve user profile with online status.
- `PATCH /api/users/profile` — Update bio or avatar for the current user.

### Conversation Endpoints
- `GET /api/conversations` — List current user's conversations with last message and unread counts.
- `POST /api/conversations` — Start or fetch direct conversation with `{ "recipientId": "<id>" }`.
- `GET /api/conversations/:id/messages?limit=50&before=<timestamp>` — Retrieve paginated messages.
- `POST /api/conversations/:id/messages` — Send message via REST `{ "content": "..." }`.
- `POST /api/conversations/:id/read` — Mark all received messages in conversation as read.

---

## WebSocket Events Documentation

### Connection Handshake
Clients connect with the JWT token in `auth`:
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'JWT_TOKEN_HERE' }
});
```

### Client -> Server Events
| Event | Payload | Description |
|---|---|---|
| `join_conversation` | `{ conversationId: string }` | Join conversation room to receive live messages |
| `send_message` | `{ conversationId: string, content: string, clientTempId?: string }` | Send a new message |
| `typing_start` | `{ conversationId: string }` | Notify partner that user has started typing |
| `typing_stop` | `{ conversationId: string }` | Notify partner that user stopped typing |
| `mark_read` | `{ conversationId: string }` | Mark all unread messages in conversation as read |

### Server -> Client Events
| Event | Payload | Description |
|---|---|---|
| `new_message` | `{ message: Message, clientTempId?: string }` | Delivered to conversation room when a message is sent |
| `user_status_changed` | `{ userId: string, isOnline: boolean, lastSeen?: string }` | Broadcasted globally when user connects or disconnects |
| `user_typing` | `{ conversationId: string, userId: string, username: string }` | Broadcasted when a partner is typing |
| `user_stopped_typing` | `{ conversationId: string, userId: string, username: string }` | Broadcasted when partner stops typing |
| `messages_read` | `{ conversationId: string, readerId: string, messageIds: string[] }` | Broadcasted when recipient reads messages |
| `conversation_updated` | `{ conversationId: string, lastMessage: Message }` | Direct push to update conversation preview in sidebar |

---

## Database Schema (Prisma PostgreSQL)

- **`users`**:
  - `id` (UUID, Primary Key)
  - `email` (String, Unique)
  - `username` (String, Unique)
  - `passwordHash` (String)
  - `avatarUrl` (String, Optional)
  - `bio` (String, Optional)
  - `lastSeen` (DateTime)
  - `createdAt`, `updatedAt` (DateTime)
- **`sessions`**:
  - `id` (UUID, Primary Key)
  - `userId` (Foreign Key -> `users.id`)
  - `token` (String, Unique)
  - `expiresAt` (DateTime)
- **`conversations`**:
  - `id` (UUID, Primary Key)
  - `isGroup` (Boolean, default `false`)
  - `createdAt`, `updatedAt` (DateTime)
- **`conversation_members`**:
  - `conversationId` (Foreign Key -> `conversations.id`)
  - `userId` (Foreign Key -> `users.id`)
  - Composite Primary Key `(conversationId, userId)`
- **`messages`**:
  - `id` (UUID, Primary Key)
  - `conversationId` (Foreign Key -> `conversations.id`)
  - `senderId` (Foreign Key -> `users.id`)
  - `content` (String, max 4000 characters)
  - `status` (`SENT` | `DELIVERED` | `READ`)
  - `createdAt`, `updatedAt` (DateTime)
  - Index: `[conversationId, createdAt]`
- **`message_reads`**:
  - `messageId` (Foreign Key -> `messages.id`)
  - `userId` (Foreign Key -> `users.id`)
  - Composite Primary Key `(messageId, userId)`

---

## Aiven Valkey & Kafka Integration Architecture

The application was specifically constructed with **Layered Inversion of Control**. Neither the controllers nor the WebSocket gateway communicate directly with raw memory or Redis/Kafka libraries.

```
Controllers / WebSocket Gateway
               │
               ▼
        Domain Services
         ├── ICacheService  ──> [ InMemoryCacheService (Current) ]  OR  [ AivenValkeyService (Future) ]
         └── IEventPublisher──> [ LocalEventPublisher (Current) ]  OR  [ AivenKafkaService (Future) ]
```

### 1. Where Aiven Valkey Connects
- **Location**: `backend/src/services/cache/`
- **Interface**: `backend/src/services/cache/ICacheService.ts`
- **Active Export**: `backend/src/services/cache/index.ts`
- **Capabilities Prepared**:
  - Multi-tab user presence (`addUserSocket`, `removeUserSocket`, `getOnlineUserIds`)
  - Ephemeral typing indicators with TTL (`setUserTyping`, `getTypingUsers`)
  - Rate limiting buckets (`checkRateLimit`)
  - Session verification & temporary chat states

#### Steps to Connect Aiven Valkey Later:
1. In `backend`, install ioredis:
   ```bash
   npm install ioredis
   npm install --save-dev @types/ioredis
   ```
2. Create `backend/src/services/cache/AivenValkeyService.ts`:
   ```typescript
   import Redis from 'ioredis';
   import { ICacheService } from './ICacheService';
   import { config } from '../../config';

   export class AivenValkeyService implements ICacheService {
     private redis: Redis;

     constructor() {
       this.redis = new Redis({
         host: config.valkey.host,
         port: config.valkey.port,
         username: config.valkey.username,
         password: config.valkey.password,
         tls: { rejectUnauthorized: false } // Required for Aiven SSL
       });
     }
     // Implement the exact ICacheService methods using Redis commands (SET, GET, SADD, SREM, SMEMBERS)
   }
   ```
3. In `backend/src/services/cache/index.ts`, change:
   ```typescript
   export const cacheService: ICacheService = new AivenValkeyService();
   ```
   **Zero lines of code in controllers, WebSocket gateway, or services need to be changed.**

---

### 2. Where Aiven Kafka Connects
- **Location**: `backend/src/services/events/`
- **Interface**: `backend/src/services/events/IEventPublisher.ts`
- **Active Export**: `backend/src/services/events/index.ts`
- **Event Contracts Prepared**:
  - `message_sent`
  - `message_read`
  - `message_delivered`
  - `message_edited`
  - `message_deleted`
  - `user_online`
  - `user_offline`
  - `user_registered`

#### Steps to Connect Aiven Kafka Later:
1. In `backend`, install KafkaJS:
   ```bash
   npm install kafkajs
   ```
2. Create `backend/src/services/events/AivenKafkaPublisher.ts`:
   ```typescript
   import { Kafka, Producer } from 'kafkajs';
   import { IEventPublisher, ChatEventType } from './IEventPublisher';
   import { config } from '../../config';

   export class AivenKafkaPublisher implements IEventPublisher {
     private kafka: Kafka;
     private producer: Producer;

     constructor() {
       this.kafka = new Kafka({
         clientId: 'chat-backend-service',
         brokers: [config.kafka.broker],
         ssl: true,
         sasl: {
           mechanism: 'scram-sha-256',
           username: config.kafka.username,
           password: config.kafka.password,
         }
       });
       this.producer = this.kafka.producer();
     }

     async publish<T>(eventType: ChatEventType, payload: T): Promise<void> {
       await this.producer.connect();
       await this.producer.send({
         topic: `chat.${eventType}`,
         messages: [{ value: JSON.stringify(payload) }]
       });
     }

     subscribe<T>(eventType: ChatEventType, handler: any): () => void {
       // Consumer implementation for background workers
       return () => {};
     }
   }
   ```
3. In `backend/src/services/events/index.ts`, change:
   ```typescript
   export const eventPublisher: IEventPublisher = new AivenKafkaPublisher();
   ```
   **Zero lines of code in controllers, WebSocket gateway, or services need to be changed.**
