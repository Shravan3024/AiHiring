require('dotenv').config();
const { generateToken } = require('./src/utils/jwt');
const axios = require('axios');

async function test() {
  const token = generateToken({ id: '1', role: 'ADMIN' });
  console.log("Token:", token);

  const payload = {
    name: "Test Frontend Payload",
    subject: "Subject",
    body: "Body",
    jobId: null,
    legalClauses: ["NDA"],
    salaryBreakupTemplate: { base: 100 },
    branding: { logo: "logo" },
    downloadAllowed: true,
    watermarkEnabled: true,
    expiryDurationDays: 30
  };

  try {
    const res = await axios.post('http://localhost:5000/api/admin/offer-templates', payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("Response:", res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

test();
