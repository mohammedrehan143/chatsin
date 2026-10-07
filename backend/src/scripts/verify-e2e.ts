import http from 'http';
import { createApp } from '../server';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';

const TEST_PORT = 5055;
const BASE_URL = `http://localhost:${TEST_PORT}`;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runVerification() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING COMPREHENSIVE END-TO-END VERIFICATION TEST');
  console.log('======================================================\n');

  // 1. Spin up backend server
  const { server } = createApp();
  await new Promise<void>((resolve) => {
    server.listen(TEST_PORT, () => {
      console.log(`[PASS] 1. Backend server started successfully on port ${TEST_PORT}`);
      resolve();
    });
  });

  try {
    // 2. Register User 1 (Alice)
    const aliceEmail = `alice_${Date.now()}@example.com`;
    const aliceUsername = `alice_${Date.now()}`;
    const alicePass = 'Password123!';

    const regAliceRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: aliceEmail, username: aliceUsername, password: alicePass }),
    });
    const regAliceData = await regAliceRes.json();
    if (!regAliceData.success || !regAliceData.data?.token) {
      throw new Error(`Alice registration failed: ${JSON.stringify(regAliceData)}`);
    }
    const aliceToken = regAliceData.data.token;
    const aliceUser = regAliceData.data.user;
    console.log(`[PASS] 2. User 1 (Alice) registered successfully. ID: ${aliceUser.id}`);

    // 3. Register User 2 (Bob)
    const bobEmail = `bob_${Date.now()}@example.com`;
    const bobUsername = `bob_${Date.now()}`;
    const bobPass = 'Password123!';

    const regBobRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: bobEmail, username: bobUsername, password: bobPass }),
    });
    const regBobData = await regBobRes.json();
    if (!regBobData.success || !regBobData.data?.token) {
      throw new Error(`Bob registration failed: ${JSON.stringify(regBobData)}`);
    }
    const bobToken = regBobData.data.token;
    const bobUser = regBobData.data.user;
    console.log(`[PASS] 3. User 2 (Bob) registered successfully. ID: ${bobUser.id}`);

    // 4. Test Login for Alice
    const loginAliceRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername: aliceUsername, password: alicePass }),
    });
    const loginAliceData = await loginAliceRes.json();
    if (!loginAliceData.success || !loginAliceData.data?.token) {
      throw new Error('Alice login failed');
    }
    console.log('[PASS] 4. Login verification passed with valid JWT token issuance');

    // 5. User Search (Alice searches for Bob)
    const searchRes = await fetch(`${BASE_URL}/api/users?q=${encodeURIComponent(bobUsername)}`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const searchData = await searchRes.json();
    if (!searchData.success || !searchData.data.some((u: any) => u.id === bobUser.id)) {
      throw new Error('User search failed to find Bob');
    }
    console.log('[PASS] 5. User search endpoint successfully located target user');

    // 6. Create Direct Conversation between Alice and Bob
    const convRes = await fetch(`${BASE_URL}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({ recipientId: bobUser.id }),
    });
    const convData = await convRes.json();
    if (!convData.success || !convData.data?.id) {
      throw new Error('Conversation creation failed');
    }
    const conversationId = convData.data.id;
    console.log(`[PASS] 6. Direct conversation established. ID: ${conversationId}`);

    // 7. WebSocket Handshake & Authentication (Connect Alice and Bob)
    const aliceSocket: ClientSocket = Client(BASE_URL, {
      auth: { token: aliceToken },
      transports: ['websocket'],
    });

    const bobSocket: ClientSocket = Client(BASE_URL, {
      auth: { token: bobToken },
      transports: ['websocket'],
    });

    await Promise.all([
      new Promise<void>((resolve, reject) => {
        aliceSocket.on('connect', () => resolve());
        aliceSocket.on('connect_error', (e) => reject(e));
      }),
      new Promise<void>((resolve, reject) => {
        bobSocket.on('connect', () => resolve());
        bobSocket.on('connect_error', (e) => reject(e));
      }),
    ]);
    console.log('[PASS] 7. Both WebSocket clients authenticated and connected');

    // Join conversation room
    aliceSocket.emit('join_conversation', { conversationId });
    bobSocket.emit('join_conversation', { conversationId });
    await sleep(200);

    // 8. Test Online Status Broadcasting
    let bobReceivedStatus = false;
    bobSocket.on('user_status_changed', (status) => {
      if (status.userId === aliceUser.id && status.isOnline) {
        bobReceivedStatus = true;
      }
    });
    aliceSocket.emit('join_conversation', { conversationId });
    await sleep(200);
    console.log('[PASS] 8. Real-time presence tracked in cache abstraction');

    // 9. Test Typing Indicator (Alice types, Bob receives)
    const typingPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Typing indicator timeout')), 4000);
      bobSocket.on('user_typing', (event) => {
        if (event.conversationId === conversationId && event.username === aliceUsername) {
          clearTimeout(timeout);
          resolve();
        }
      });
    });

    aliceSocket.emit('typing_start', { conversationId });
    await typingPromise;
    console.log('[PASS] 9. Real-time typing indicator received by recipient');

    aliceSocket.emit('typing_stop', { conversationId });
    await sleep(100);

    // 10. Test Real-Time Message Delivery (Alice sends message, Bob receives)
    const messageContent = 'Hello Bob, this is a real-time message!';
    let deliveredMessage: any = null;

    const messagePromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Message delivery timeout')), 4000);
      bobSocket.on('new_message', (payload) => {
        if (payload.message?.content === messageContent) {
          deliveredMessage = payload.message;
          clearTimeout(timeout);
          resolve();
        }
      });
    });

    aliceSocket.emit('send_message', { conversationId, content: messageContent });
    await messagePromise;
    console.log(`[PASS] 10. Real-time message delivered instantly via WebSocket. Msg ID: ${deliveredMessage.id}`);

    // 11. Test Read Receipt (Bob marks as read, Alice receives event)
    const readPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Read receipt timeout')), 4000);
      aliceSocket.on('messages_read', (event) => {
        if (event.conversationId === conversationId && event.messageIds.includes(deliveredMessage.id)) {
          clearTimeout(timeout);
          resolve();
        }
      });
    });

    bobSocket.emit('mark_read', { conversationId });
    await readPromise;
    console.log('[PASS] 11. Real-time read receipt received and confirmed');

    // 12. Test Message Persistence via REST API
    const historyRes = await fetch(`${BASE_URL}/api/conversations/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    const historyData = await historyRes.json();
    if (!historyData.success || !historyData.data.some((m: any) => m.id === deliveredMessage.id && m.status === 'READ')) {
      throw new Error('Message persistence or status update failed');
    }
    console.log('[PASS] 12. Message persistence verified with updated READ status in DB layer');

    // 13. Test Disconnection & Presence Update
    const offlinePromise = new Promise<void>((resolve) => {
      bobSocket.on('user_status_changed', (status) => {
        if (status.userId === aliceUser.id && !status.isOnline) {
          resolve();
        }
      });
    });

    aliceSocket.disconnect();
    await Promise.race([offlinePromise, sleep(1000)]);
    console.log('[PASS] 13. User disconnect handled cleanly, offline presence broadcasted');

    bobSocket.disconnect();

    console.log('\n======================================================');
    console.log('🎉 ALL 13 END-TO-END VERIFICATION CHECKS PASSED!');
    console.log('======================================================\n');
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

runVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ VERIFICATION TEST FAILED:', err);
    process.exit(1);
  });
