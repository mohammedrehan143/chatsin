# Real-Time Gotchas & Mitigation Strategies

1. **Multi-Tab Socket Presence**:
   - *Problem*: A user opens 3 browser tabs. Closing 1 tab triggers a disconnect. If presence marks them offline immediately, their other active tabs become inconsistent.
   - *Mitigation*: Track user sockets in a Set (`userId -> Set<socketId>`). A user is only marked `offline` when their socket set count reaches 0.

2. **Socket Authentication & Handshake Failure Handling**:
   - *Problem*: Invalid or expired JWT tokens during WebSocket handshake can cause infinite reconnect loops.
   - *Mitigation*: Validate token in Socket.IO middleware (`io.use(...)`). If invalid, reject connection with an explicit authentication error (`next(new Error('unauthorized'))`) so client can re-authenticate or clear session.

3. **Message Ordering & Optimistic Updates**:
   - *Problem*: Network lag might cause messages to render out of order or duplicate on retry.
   - *Mitigation*: Client assigns a temporary client ID for optimistic rendering; server responds with canonical database UUID and timestamp.

4. **Typing Indicator Flooding**:
   - *Problem*: Emitting a socket event on every keystroke overwhelms the network.
   - *Mitigation*: Debounce typing emission on client (e.g. 1.5s delay) and auto-expire typing state on server/cache.

5. **Cross-Origin Socket CORS in Next.js**:
   - *Problem*: Next.js running on `localhost:3000` connecting to Socket.IO on `localhost:5000` fails preflight or WebSocket upgrade.
   - *Mitigation*: Configure CORS credentials and origin explicitly on both Express HTTP app and Socket.IO server constructor.
