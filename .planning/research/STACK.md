# Tech Stack & Dependency Selection

## Backend Stack
- **Runtime**: Node.js 18+ / 20+ with TypeScript
- **HTTP Framework**: `express` (^4.19.2) + `@types/express`
- **Real-Time Engine**: `socket.io` (^4.7.5)
- **Database ORM**: `prisma` & `@prisma/client` (^5.18.0)
- **Authentication**: `jsonwebtoken` (^9.0.2) + `bcryptjs` (^2.4.3)
- **Validation**: `zod` (^3.23.8)
- **Security & Utilities**: `cors`, `helmet`, `dotenv`, `ts-node-dev`

## Frontend Stack
- **Framework**: Next.js 14 / 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Real-Time Client**: `socket.io-client` (^4.7.5)
- **Icons**: `lucide-react`
- **HTTP Client**: Native `fetch` with typed wrapper / Axios
- **State Management**: React Context / Zustand for Auth, Active Conversation, Presence, and Socket lifecycle
