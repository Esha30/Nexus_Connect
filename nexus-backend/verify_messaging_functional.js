/**
 * Automated Messaging System Verification
 * Verifies End-to-End messaging functionality via Backend API.
 */

import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'http://localhost:5001/api';

async function verifyMessaging() {
  console.log('🚀 Starting Messaging Verification...');

  try {
    // 1. LOGIN AS ENTREPRENEUR
    console.log('--- Phase 1: Entrepreneur Login ---');
    const entLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'entrepreneur@nexus.test', password: 'Test1234!' })
    });
    const entData = await entLoginRes.json();
    if (!entData.token) throw new Error('Entrepreneur login failed: ' + JSON.stringify(entData));
    const entToken = entData.token;
    const entId = entData._id;
    console.log('✅ Alex Carter (Entrepreneur) logged in.');

    // 2. LOGIN AS INVESTOR
    console.log('--- Phase 2: Investor Login ---');
    const invLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'investor@nexus.test', password: 'Test1234!' })
    });
    const invData = await invLoginRes.json();
    if (!invData.token) throw new Error('Investor login failed: ' + JSON.stringify(invData));
    const invToken = invData.token;
    const invId = invData._id;
    console.log('✅ Sarah Mitchell (Investor) logged in.');

    // 3. ALEX SENDS MESSAGE TO SARAH
    console.log('--- Phase 3: Alex sends message to Sarah ---');
    const msgContent = `Test message at ${new Date().toISOString()}`;
    const sendRes = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${entToken}`
      },
      body: JSON.stringify({ recipientId: invId, receiverId: invId, content: msgContent }) // Using both recipientId/receiverId to be safe with controller logic
    });
    const msgData = await sendRes.json();
    if (!msgData.id) throw new Error('Message send failed: ' + JSON.stringify(msgData));
    console.log('✅ Message sent from Alex to Sarah.');

    // 4. SARAH CHECKS MESSAGES
    console.log('--- Phase 4: Sarah retrieves message ---');
    const getMsgsRes = await fetch(`${API_BASE}/messages/${entId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${invToken}` }
    });
    const messages = await getMsgsRes.json();
    const received = messages.find(m => m.content === msgContent);
    if (!received) throw new Error('Message not found in Sarah\'s inbox!');
    console.log('✅ Sarah confirmed receipt of Alex\'s message.');

    // 5. SARAH REPLIES
    console.log('--- Phase 5: Sarah replies to Alex ---');
    const replyContent = "Got your message, Alex! System verification successful.";
    const replyRes = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${invToken}`
      },
      body: JSON.stringify({ receiverId: entId, content: replyContent })
    });
    console.log('✅ Sarah sent reply.');

    // 6. ALEX CHECKS REPLY
    console.log('--- Phase 6: Alex confirms reply ---');
    const getRepliesRes = await fetch(`${API_BASE}/messages/${invId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${entToken}` }
    });
    const entMessages = await getRepliesRes.json();
    const replyReceived = entMessages.find(m => m.content === replyContent);
    if (!replyReceived) throw new Error('Reply not found in Alex\'s inbox!');
    console.log('✅ Alex confirmed receipt of Sarah\'s reply.');

    console.log('\n🌟 MESSAGING SYSTEM VERIFIED SUCCESSFULLY! 🌟');
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification Failed:', error.message);
    process.exit(1);
  }
}

verifyMessaging();
