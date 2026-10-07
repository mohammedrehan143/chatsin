# Roadmap: Production Real-Time Chat Application

## Overview

A structured 7-phase path to construct an enterprise-grade real-time chat application with completely separated Next.js and Express services, type-safe PostgreSQL persistence via Prisma, decoupled Valkey and Kafka abstraction services, and interactive WebSocket communication.

## Phases

- [ ] **Phase 1: Project Setup & Decoupled Foundation** - Scaffold independent `frontend/` and `backend/` environments, configs, scripts, and error response envelopes.
- [ ] **Phase 2: Database Schema & Core Abstractions** - PostgreSQL Prisma models, repository pattern, in-memory Valkey-ready Cache service, and Kafka-ready Event publisher.
- [ ] **Phase 3: Authentication, Users & Profile API** - Secure bcrypt signup, login, JWT bearer generation, profile management, and contact search endpoints.
- [ ] **Phase 4: Conversations & Messages REST API** - 1-to-1 conversation management, paginated message history, and unread counters.
- [ ] **Phase 5: Real-Time WebSocket Architecture** - Socket.IO gateway, JWT connection auth, real-time message delivery, typing indicators, read receipts, and presence synchronization.
- [ ] **Phase 6: Next.js Modern Chat Interface** - Polished responsive Next.js/Tailwind UI with 3-pane desktop layout, conversation list, live chat window, typing indicators, and profile modal.
- [ ] **Phase 7: End-to-End Integration & Verification** - Multi-user automated/manual verification suite testing real-time delivery, presence, typing, read receipts, and persistence.

## Phase Details

### Phase 1: Project Setup & Decoupled Foundation
**Goal**: Establish clean separation between frontend and backend with independent runtime environments.
**Depends on**: Nothing
**Requirements**: ARCH-01, ARCH-02, ARCH-03
**Success Criteria**:
  1. `frontend/` and `backend/` directories exist with independent `package.json` files and can run independently.
  2. `.env.example` templates exist for root, frontend, and backend with no leaked secrets.
  3. Express server starts with centralized error handler returning standard `{ success, data/error }` envelopes.
**Plans**: 2 plans

Plans:
- [ ] 01-01: Scaffold backend directory with Express, TypeScript, ts-node-dev, CORS, helmet, and error envelope
- [ ] 01-02: Scaffold frontend directory with Next.js App router, TypeScript, Tailwind CSS, and environment configs

### Phase 2: Database Schema & Core Abstractions
**Goal**: Design PostgreSQL persistence and decoupled Cache & Event interfaces prepared for Aiven Valkey and Kafka.
**Depends on**: Phase 1
**Requirements**: DATA-01, DATA-02, ABST-01, ABST-02
**Success Criteria**:
  1. Prisma schema cleanly represents users, conversations, conversation_members, messages, message_reads, and sessions.
  2. Repositories abstract all database queries away from services and controllers.
  3. `ICacheService` interface implemented with in-memory store supporting presence, typing, and sessions.
  4. `IEventPublisher` interface implemented with local event emitter supporting all chat domain events.
**Plans**: 2 plans

Plans:
- [ ] 02-01: Configure Prisma schema, migrations/client, and isolated repository layer (`UserRepository`, `ConversationRepository`, `MessageRepository`)
- [ ] 02-02: Implement `ICacheService` in-memory engine and `IEventPublisher` event bus with domain event contracts

### Phase 3: Authentication, Users & Profile API
**Goal**: Deliver secure user registration, credential authentication, JWT token issuance, and user search.
**Depends on**: Phase 2
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, USER-01
**Success Criteria**:
  1. Users can register with email and username; passwords are encrypted with bcrypt.
  2. Users can log in and receive valid JWT Bearer tokens.
  3. Protected routes validate JWT tokens via auth middleware.
  4. Users can search for other registered users by username or email.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Auth controller and service for register, login, logout, and token validation middleware
- [ ] 03-02: Users controller and service for profile fetching, profile updating, and user discovery search

### Phase 4: Conversations & Messages REST API
**Goal**: Implement business logic and REST endpoints for 1-to-1 conversations and historical message retrieval.
**Depends on**: Phase 3
**Requirements**: CONV-01, CONV-02, MESS-01, MESS-02
**Success Criteria**:
  1. Users can initiate or fetch an existing 1-to-1 conversation with another user.
  2. Conversation list returns last message timestamp, content snippet, and unread counts.
  3. Messages can be queried with cursor/pagination for smooth chat history loading.
**Plans**: 2 plans

Plans:
- [ ] 04-01: Conversation controller, service, and routes with membership validation
- [ ] 04-02: Message controller, service, and routes with paginated query and persistence

### Phase 5: Real-Time WebSocket Architecture
**Goal**: Deploy robust Socket.IO gateway with handshake authentication, message delivery, typing events, and presence.
**Depends on**: Phase 4
**Requirements**: SOCK-01, SOCK-02, SOCK-03, SOCK-04, SOCK-05
**Success Criteria**:
  1. WebSockets authenticate incoming connections with JWT tokens; unauthenticated connections are rejected.
  2. Messages sent via WebSocket are saved to DB and broadcast to conversation members instantly.
  3. Typing indicator events trigger ephemeral typing notifications with debounce protection.
  4. User online/offline presence is tracked accurately across multiple browser tabs and broadcasted.
  5. Read receipts update message state and notify senders in real time.
**Plans**: 2 plans

Plans:
- [ ] 05-01: Socket.IO server setup, handshake JWT authentication, socket connection registry, and presence engine
- [ ] 05-02: Real-time chat message delivery handler, typing indicator handler, and read receipt acknowledgment

### Phase 6: Next.js Modern Chat Interface
**Goal**: Build a responsive, real-world chat application UI with Next.js, Tailwind CSS, and Socket.IO client.
**Depends on**: Phase 5
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06
**Success Criteria**:
  1. Polished Authentication screens with validation and state transitions.
  2. Modern 3-pane layout on desktop (Sidebar -> Chat Window -> User Details) and full-screen views on mobile.
  3. Interactive conversation sidebar with search bar, online status dots, and unread count badges.
  4. Chat window with message bubbles, status checkmarks (Sent/Delivered/Read), timestamps, and typing indicator.
  5. Socket hook handles reconnects, presence changes, and live message appending.
**Plans**: 3 plans

Plans:
- [ ] 06-01: Frontend core client (API service, Auth context, Socket context, and token storage)
- [ ] 06-02: Auth screens (Login, Signup) and protected application shell with responsive layout
- [ ] 06-03: Chat UI components (Conversation list, Search dialog, Message feed, Message input, Typing indicator, Profile modal)

### Phase 7: End-to-End Integration & Verification
**Goal**: Run end-to-end multi-user validation, fix TypeScript/runtime errors, and document operational procedures.
**Depends on**: Phase 6
**Requirements**: VERI-01
**Success Criteria**:
  1. Two test user sessions communicate concurrently with real-time message delivery and read receipts.
  2. Typing indicators and online/offline status transition accurately between sessions.
  3. No secrets exposed to client; clean TypeScript builds on both frontend and backend.
  4. Comprehensive documentation provided explaining execution steps, API specs, and Valkey/Kafka migration guides.
**Plans**: 1 plan

Plans:
- [ ] 07-01: End-to-end concurrent user validation, build check, security audit, and final project documentation

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Setup & Decoupled Foundation | 0/2 | Not started | - |
| 2. Database Schema & Core Abstractions | 0/2 | Not started | - |
| 3. Authentication, Users & Profile API | 0/2 | Not started | - |
| 4. Conversations & Messages REST API | 0/2 | Not started | - |
| 5. Real-Time WebSocket Architecture | 0/2 | Not started | - |
| 6. Next.js Modern Chat Interface | 0/3 | Not started | - |
| 7. End-to-End Integration & Verification | 0/1 | Not started | - |
