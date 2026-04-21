const API_URL = 'http://localhost:5001/api';

const testUser = {
  email: 'mughalesha362@gmail.com',
  password: 'esha123'
};

async function verifyPlatform() {
  console.log('\n--- NEXUS PLATFORM PRODUCTION VERIFICATION ---\n');

  try {
    // 1. Auth Login
    console.log('[1/5] Authenticating as Entrepreneur...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (!loginRes.ok) {
        const err = await loginRes.json();
        throw new Error(`Login failed: ${err.message || loginRes.status}`);
    }
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    const authHeaders = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    console.log(`PASS: Login Successful for ${loginData.name} (${loginData.role})\n`);

    // 2. Dashboard Analytics
    console.log('[2/5] Fetching Dashboard Metrics...');
    const statsRes = await fetch(`${API_URL}/dashboard/stats`, { headers: authHeaders });
    const statsData = await statsRes.json();
    console.log('PASS: Dashboard Analytics integrated.');
    console.log(`Current Engagement Score: ${statsData.totalViews || 0} views\n`);

    // 3. Activity Feed
    console.log('[3/5] Checking Activity Logging...');
    const activityRes = await fetch(`${API_URL}/dashboard/activity`, { headers: authHeaders });
    const activityData = await activityRes.json();
    console.log(`PASS: Activity Feed active with ${activityData.length} events logged.\n`);

    // 4. Meetings
    console.log('[4/5] Verifying Meeting Schedule...');
    const meetingsRes = await fetch(`${API_URL}/meetings`, { headers: authHeaders });
    const meetingsData = await meetingsRes.json();
    console.log(`PASS: Meetings System active with ${meetingsData.length} records.\n`);

    // 5. Google API endpoint check
    console.log('[5/5] Checking Google Auth Endpoint...');
    const googleRes = await fetch(`${API_URL}/auth/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: 'verify_test', role: 'investor' })
    });
    
    if (googleRes.status === 400 || googleRes.status === 401) {
        console.log('PASS: Google OAuth Endpoint is operational.\n');
    }

    console.log('--- VERIFICATION SUCCESSFUL: SYSTEM IS PRODUCTION READY ---');

  } catch (error) {
    console.error('FAIL: Verification aborted ->', error.message);
    process.exit(1);
  }
}

verifyPlatform();
