/**
 * Automated Signaling Verification for Voice/Video Calls
 * Verifies that WebRTC signals (Offer, Answer, ICE) are correctly relayed between users.
 */

import { io } from 'socket.io-client';
import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';

async function verifySignaling() {
  console.log('🚀 Starting WebRTC Signaling Verification...');

  try {
    // 1. LOGIN AS ALEX (Entrepreneur)
    const entRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'entrepreneur@nexus.test', password: 'Test1234!' })
    });
    const entData = await entRes.json();
    const entToken = entData.token;
    const entId = entData._id;

    // 2. LOGIN AS SARAH (Investor)
    const invRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'investor@nexus.test', password: 'Test1234!' })
    });
    const invData = await invRes.json();
    const invToken = invData.token;
    const invId = invData._id;

    // 3. CONNECT SOCKETS
    console.log('--- Phase 1: Connecting Sockets ---');
    const entSocket = io(SOCKET_URL, { auth: { token: entToken } });
    const invSocket = io(SOCKET_URL, { auth: { token: invToken } });

    await Promise.all([
      new Promise(res => entSocket.on('connect', res)),
      new Promise(res => invSocket.on('connect', res))
    ]);
    console.log('✅ Both users connected to Socket.io.');

    // Join rooms
    entSocket.emit('join-chat', entId);
    invSocket.emit('join-chat', invId);

    // 4. TEST OFFER (Alex -> Sarah)
    console.log('--- Phase 2: Testing Offer (Alex -> Sarah) ---');
    const mockOffer = { 
      target: invId, 
      caller: entId, 
      signal: { type: 'offer', sdp: 'v=0\r\no=- 1234 5678 IN IP4 127.0.0.1...' },
      callType: 'video'
    };

    const offerPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Sarah did not receive offer')), 5000);
      invSocket.once('offer', (payload) => {
        clearTimeout(timeout);
        if (payload.caller === entId) {
          console.log('✅ Sarah received Alex\'s offer.');
          resolve(payload);
        } else {
          reject(new Error('Offer from unexpected caller'));
        }
      });
    });

    entSocket.emit('offer', mockOffer);
    await offerPromise;

    // 5. TEST ANSWER (Sarah -> Alex)
    console.log('--- Phase 3: Testing Answer (Sarah -> Alex) ---');
    const mockAnswer = {
      target: entId,
      signal: { type: 'answer', sdp: 'v=0\r\no=- 5678 1234 IN IP4 127.0.0.1...' }
    };

    const answerPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Alex did not receive answer')), 5000);
      entSocket.once('answer', (payload) => {
        clearTimeout(timeout);
        console.log('✅ Alex received Sarah\'s answer.');
        resolve(payload);
      });
    });

    invSocket.emit('answer', mockAnswer);
    await answerPromise;

    // 6. TEST ICE CANDIDATES (Alex -> Sarah)
    console.log('--- Phase 4: Testing ICE Candidates ---');
    const mockCandidate = {
      target: invId,
      candidate: { candidate: 'candidate:842163049 1 udp 1677729535 127.0.0.1 5001 typ host...', sdpMid: '0', sdpMLineIndex: 0 }
    };

    const icePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Sarah did not receive ICE candidate')), 5000);
      invSocket.once('ice-candidate', (payload) => {
        clearTimeout(timeout);
        console.log('✅ Sarah received Alex\'s ICE candidate.');
        resolve(payload);
      });
    });

    entSocket.emit('ice-candidate', mockCandidate);
    await icePromise;

    console.log('\n🌟 CALLING SIGNALING VERIFIED SUCCESSFULLY! 🌟');
    entSocket.disconnect();
    invSocket.disconnect();
    process.exit(0);

  } catch (err) {
    console.error('❌ Signaling Verification Failed:', err.message);
    process.exit(1);
  }
}

verifySignaling();
