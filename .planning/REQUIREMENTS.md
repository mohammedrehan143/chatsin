# Requirements: Production Real-Time Chat Application

**Defined:** 2026-10-07
**Core Value:** Instant, reliable real-time messaging with rock-solid delivery, presence synchronization, and decoupled backend architecture that scales cleanly without rewrites.

## v1 Requirements

### Project Structure & Decoupling
- [x] **ARCH-01**: Root repository with independent `frontend/` and `backend/` directories, each with its own `package.json`, TypeScript configuration, and dev scripts
- [x] **ARCH-02**: Environment configuration templates (`.env.example` in root, `frontend/.env.example`, `backend/.env.example`) with zero secret leakage
- [x] **ARCH-03**: Centralized error handling and standardized JSON response envelope (`{ success: true, data }` / `{ success: false, error: { code, message } }`)

### Database & Repositories
- [x] **DATA-01**: PostgreSQL Prisma schema defining `users`, `conversations`, `conversation_members`, `messages`, `message_reads`, and `sessions`
- [x] **DATA-02**: Isolated repository layer (`backend/src/repositories/`) shielding controllers and services from raw database queries

### Abstractions (Valkey & Kafka Preparation)
- [x] **ABST-01**: Cache abstraction interface (`ICacheService`) with an in-memory development driver supporting online users, typing status, session validation, and rate limits (prepared for Aiven Valkey)
- [x] **ABST-02**: Event publisher abstraction interface (`IEventPublisher`) with a local event driver supporting `message_sent`, `message_read`, `user_online`, `user_offline`, and `user_registered` (prepared for Aiven Kafka)

### Authentication & Users
- [x] **AUTH-01**: User registration with email, username, and bcrypt-hashed password
- [x] **AUTH-02**: User login returning signed JWT Bearer token and user profile
- [x] **AUTH-03**: User logout invalidating local/cached session
- [x] **AUTH-04**: Current user profile retrieval and update (avatar, bio, display name)
- [x] **USER-01**: User search endpoint to discover contacts by username or email

### Conversations & Messaging
- [x] **CONV-01**: Fetch list of user conversations with last message, unread count, and recipient metadata
- [x] **CONV-02**: Create or get existing 1-to-1 conversation between two users
- [x] **MESS-01**: Paginated retrieval of message history for a conversation
- [x] **MESS-02**: REST endpoint to send a message as fallback/standard API

### Real-Time WebSocket (Socket.IO)
- [x] **SOCK-01**: Authenticated WebSocket handshake validating JWT Bearer token
- [x] **SOCK-02**: Real-time message sending and delivery to active conversation members
- [x] **SOCK-03**: Real-time typing indicators with client-side debounce and server-side ephemeral state
- [x] **SOCK-04**: Real-time online/offline presence tracking (handling multi-tab sessions cleanly)
- [x] **SOCK-05**: Real-time read receipt emission and status synchronization

### Frontend (Next.js & Tailwind CSS)
- [x] **UI-01**: Authentication screens (Polished Login & Signup views with validation and error alerts)
- [x] **UI-02**: Responsive modern layout (Desktop 3-pane: Sidebar -> Chat Window -> Profile/Details; Mobile responsive view)
- [x] **UI-03**: Conversation sidebar with real-time contact list, search bar, unread badge counters, and online indicators
- [x] **UI-04**: Chat window with message bubbles, timestamps, delivery/read checkmarks, and auto-scroll
- [x] **UI-05**: Real-time typing indicator banner and message input area
- [x] **UI-06**: User profile drawer/modal showing status, last seen, and avatar

### Testing & Verification
- [x] **VERI-01**: End-to-end verification script testing two simultaneous user accounts communicating over real-time WebSockets with message persistence

## v2 Requirements

### Advanced Chat Features
- **V2-01**: Multi-user group conversations and channels
- **V2-02**: Rich media and file attachment uploads
- **V2-03**: Message editing and soft-deletion with audit events
- **V2-04**: Direct connection to Aiven Valkey cluster via Redis client
- **V2-05**: Direct connection to Aiven Kafka cluster via KafkaJS producer/consumer

## Out of Scope

| Feature | Reason |
|---------|--------|
| Live Aiven Valkey / Kafka connection in v1 | Specified requirement to design clean abstractions first without live cloud dependency |
| Audio/Video WebRTC calling | Out of scope for v1 text chat core value |
| End-to-End Encryption (E2EE) | High complexity, server-side persistence required for v1 |
| Native mobile applications | Web-first responsive Next.js application |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ARCH-01 | Phase 1 | Complete |
| ARCH-02 | Phase 1 | Complete |
| ARCH-03 | Phase 1 | Complete |
| DATA-01 | Phase 2 | Complete |
| DATA-02 | Phase 2 | Complete |
| ABST-01 | Phase 2 | Complete |
| ABST-02 | Phase 2 | Complete |
| AUTH-01 | Phase 3 | Complete |
| AUTH-02 | Phase 3 | Complete |
| AUTH-03 | Phase 3 | Complete |
| AUTH-04 | Phase 3 | Complete |
| USER-01 | Phase 3 | Complete |
| CONV-01 | Phase 4 | Complete |
| CONV-02 | Phase 4 | Complete |
| MESS-01 | Phase 4 | Complete |
| MESS-02 | Phase 4 | Complete |
| SOCK-01 | Phase 5 | Complete |
| SOCK-02 | Phase 5 | Complete |
| SOCK-03 | Phase 5 | Complete |
| SOCK-04 | Phase 5 | Complete |
| SOCK-05 | Phase 5 | Complete |
| UI-01 | Phase 6 | Complete |
| UI-02 | Phase 6 | Complete |
| UI-03 | Phase 6 | Complete |
| UI-04 | Phase 6 | Complete |
| UI-05 | Phase 6 | Complete |
| UI-06 | Phase 6 | Complete |
| VERI-01 | Phase 7 | Complete |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Completed: 28 (100%) ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-10-07*
*Last updated: 2026-10-07 after all 7 phases completed*
