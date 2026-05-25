const { uploadResume } = require('./src/controllers/resume.controller');
const fs = require('fs');

async function testUpload() {
  const req = {
    file: {
      path: 'package.json',
      filename: 'package.json'
    },
    body: {},
    user: {
      id: 1, // Assuming a valid user ID, though we don't know the DB state.
      role: 'CANDIDATE'
    }
  };

  const res = {
    status: (code) => {
      console.log('Status:', code);
      return {
        json: (data) => console.log('Response JSON:', data)
      };
    }
  };

  try {
    await uploadResume(req, res);
  } catch (err) {
    console.error('Uncaught Exception:', err);
  }
}

testUpload();
