const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  try {
    // 1. We need a token. We can query the DB for a valid candidate and generate a token for them.
    const jwt = require('jsonwebtoken');
    // Find an active session
    const { CandidateSession, Candidate, User } = require('./src/models');
    
    const session = await CandidateSession.findOne({ where: { is_active: true }, include: [{ model: Candidate, include: [User] }] });
    if (!session) {
      console.log('No active session found.');
      process.exit(1);
    }
    
    const token = session.session_token;
    
    // 2. Prepare FormData
    const formData = new FormData();
    // Create a dummy valid PDF file
    const pdfkit = require('pdfkit');
    const doc = new pdfkit();
    const stream = fs.createWriteStream('test-resume.pdf');
    doc.pipe(stream);
    doc.text('John Doe\nSoftware Engineer\n5 years experience\nReact, Node.js');
    doc.end();
    
    await new Promise(resolve => stream.on('finish', resolve));
    
    formData.append('resume', fs.createReadStream('test-resume.pdf'));
    
    // 3. Make request
    console.log('Sending request to upload resume...');
    const response = await axios.post('http://localhost:5000/api/dashboard/candidate/resume/upload', formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Success!', response.status, response.data);
    
  } catch (error) {
    if (error.response) {
      console.error('Error Response:', error.response.status, error.response.data);
    } else {
      console.error('Request failed:', error.message);
    }
  } finally {
    process.exit();
  }
}

testUpload();
