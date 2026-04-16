async function testHRApi() {
  try {
    // 1. Login HR
    const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hr@example.com', password: 'password123' })
    });
    
    if (!loginRes.ok) {
      console.log("Login failed!", await loginRes.text());
      return;
    }
    const { token } = await loginRes.json();
    
    // 2. Fetch HR applications
    const appsRes = await fetch('http://127.0.0.1:5000/api/hr/applications', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!appsRes.ok) {
      console.log("Fetch fail:", await appsRes.text());
      return;
    }
    
    const apps = await appsRes.json();
    console.log(`Found ${apps.length ?? 0} applications.`);
    if (apps.length > 0) {
      console.log("First app:", JSON.stringify(apps[0], null, 2));
    } else {
      console.log("Response:", apps);
    }
    
  } catch(e) {
    console.error("Connection Error:", e.message);
  }
}

testHRApi();
