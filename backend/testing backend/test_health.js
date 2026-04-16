const axios = require('axios');

const test = async () => {
  try {
    console.log('Testing: http://localhost:3000/api/ai/health\n');
    const res = await axios.get('http://localhost:3000/api/ai/health');
    console.log('✅ Status:', res.status);
    console.log('✅ Response:', JSON.stringify(res.data).substring(0, 200));
  } catch (error) {
    console.log('❌ Error:', error.response?.status || error.message);
    if (error.response?.data) {
      console.log('Response:', error.response.data.substring ? error.response.data.substring(0, 200) : error.response.data);
    }
  }
  process.exit(0);
};

test();
