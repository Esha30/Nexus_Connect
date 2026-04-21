import fetch from 'node-fetch';

const API_URL = 'http://localhost:5001/api';

const testUser = {
  email: 'mughalesha362@gmail.com',
  password: 'esha123'
};

async function testAI() {
  console.log('\n--- AI FUNCTIONALITY TEST ---\n');

  try {
    console.log('[1/4] Authenticating...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (!loginRes.ok) {
        throw new Error(`Login failed: ${loginRes.status}`);
    }
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    const authHeaders = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    console.log(`PASS: Login Successful. Token obtained.\n`);

    console.log('[2/4] Testing AI Connection...');
    const connRes = await fetch(`${API_URL}/ai/test-connection`, { headers: authHeaders });
    const connData = await connRes.json();
    console.log('Connection Test Output:', connData);
    if (connData.status === 'SUCCESS') {
        console.log('PASS: AI Connection OK.\n');
    } else {
        console.error('FAIL: AI Connection failed.');
    }

    console.log('[3/4] Testing AI Copilot Chat...');
    const chatRes = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
            message: "What are the three most important things for a VC pitch?",
            history: []
        })
    });
    const chatData = await chatRes.json();
    if (chatData.response) {
        console.log('Chat Output:\n', chatData.response);
        console.log('PASS: AI Copilot Chat OK.\n');
    } else {
        console.error('FAIL: AI Chat failed.', chatData);
    }
    
    console.log('[4/4] Testing Elevator Pitch Generation...');
    // We will use the currently logged in user as the targetUserId for simplicity
    const pitchRes = await fetch(`${API_URL}/ai/pitch`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
            targetUserId: loginData._id
        })
    });
    const pitchData = await pitchRes.json();
    if (pitchData.pitch) {
        console.log('Pitch Output:\n', pitchData.pitch);
        console.log('PASS: AI Pitch generation OK.\n');
    } else {
        console.error('FAIL: Pitch generation failed.', pitchData);
    }

    console.log('--- ALL AI TESTS COMPLETED ---');

  } catch (error) {
    console.error('FAIL: Test aborted ->', error.message);
    process.exit(1);
  }
}

testAI();
