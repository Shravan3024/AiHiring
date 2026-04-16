const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    // 1. Login
    const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'candidate@example.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    
    // 2. Upload PDF
    const { Blob } = require('buffer');
    const fileBytes = fs.readFileSync('test_resume.pdf');
    const fileBlob = new Blob([fileBytes], { type: 'application/pdf' });
    
    const formData = new FormData();
    formData.append('resume', fileBlob, 'test_resume.pdf');
    
    const uploadRes = await fetch('http://127.0.0.1:5000/api/dashboard/candidate/resume/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    const uploadData = await uploadRes.json();
    console.log("Upload Response:", JSON.stringify(uploadData, null, 2));
    
  } catch(e) {
    console.error("Test Error:", e);
  }
}

testUpload();
