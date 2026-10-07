# Production Real-Time Chat Application

## What This Is

A production-quality real-time chat application with a completely separated Next.js frontend and Express/Socket.IO backend. Built for 1-to-1 real-time messaging, typing indicators, user presence, and read receipts, with isolated abstraction layers ready for future cloud-scale integration with Aiven Valkey (Redis-compatible cache) and Aiven Kafka (event streaming).

## Core Value

Instant, reliable real-time messaging with rock-solid delivery, presence synchronization, and decoupled backend architecture that scales cleanly without rewrites.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Complete decoupled repository structure (`frontend/` and `backend/`)
- [ ] User authentication (Registration, Login, Logout with secure bcrypt password hashing and JWT Bearer tokens)
- [ ] PostgreSQL database schema using Prisma ORM (`users`, `conversations`, `conversation_members`, `messages`, `message_reads`, `sessions`)
- [ ] Repository layer abstraction (`backend/src/repositories/`) isolating all database access
- [ ] In-memory Cache service abstraction (`backend/src/services/cache/`) prepared for Aiven Valkey (presence, typing, sessions, rate limits)
- [ ] Event publisher abstraction (`backend/src/services/events/`) prepared for Aiven Kafka (`message_sent`, `user_online`, etc.)
- [ ] Real-time WebSocket architecture using Socket.IO with JWT authentication and status broadcasting
- [ ] REST API endpoints for Auth, Users, User Search, Conversations, Messages, and Profile
- [ ] Next.js 14+ App Router frontend with Tailwind CSS and responsive design (desktop 3-pane layout, mobile full-screen views)
- [ ] Real-time chat UI with conversation list, user search, active chat, message input, typing indicators, and read receipts
- [ ] Comprehensive error handling, request validation (Zod), and security boundaries (CORS, token separation, rate limiting)
- [ ] Environment variable separation (`.env.example` for root, frontend, backend)
- [ ] End-to-end verification and testing with two concurrent test accounts

### Out of Scope

- Direct live connection to Aiven Valkey in v1 (only cleanly designed abstraction interfaces and in-memory engine)
- Direct live connection to Aiven Kafka in v1 (only cleanly designed publisher interfaces and local event emitter)
- Audio/video calling or WebRTC media streams
- End-to-end message encryption (E2EE) in v1
- Group chat channels (deferred to subsequent milestone after 1-to-1 messaging is validated)

## Context

- Target architecture cleanly separates the Next.js client (`localhost:3000`) and Express server (`localhost:5000` or configured port) with CORS and standalone WebSocket channels (`NEXT_PUBLIC_WS_URL`).
- All controllers remain razor-thin, routing commands to dedicated domain services (`auth/`, `chat/`, `database/`, `cache/`, `events/`).
- Future integration with Aiven Valkey and Aiven Kafka will simply be swapping implementation drivers behind existing service interfaces without touching business logic or controllers.

## Constraints

- **Architecture**: Complete separation between `frontend/` and `backend/`; independent `package.json` and dev runtimes.
- **Frontend Stack**: Next.js (App Router), TypeScript, Tailwind CSS, Lucide icons, Socket.io-client.
- **Backend Stack**: Node.js, Express, TypeScript, Socket.IO, Prisma ORM, PostgreSQL.
- **Security**: JWT Bearer token authentication in HTTP headers and Socket.IO handshake auth; no backend secrets leaked to client.
- **Database**: Direct PostgreSQL required with Prisma migrations and isolated repository pattern.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Prisma ORM | Type-safe schema definition, declarative migrations, and auto-generated TypeScript clients | — Pending |
| JWT Bearer Token | Consistent token-based auth compatible across Next.js API client and Socket.IO handshake | — Pending |
| Cache & Event Abstractions | Prepare application for Aiven Valkey & Kafka without premature cloud dependencies | — Pending |
| Independent Monorepo Structure | Allows frontend and backend to run, deploy, and scale independently | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-07 after initialization*
