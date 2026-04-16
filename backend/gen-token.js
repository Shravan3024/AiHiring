const jwt = require('jsonwebtoken');

// Generate a valid JWT token
const payload = {
  id: 1,  // Assuming user ID 1 exists
  email: 'hr@company.com',
  role: 'HR',
};

const token = jwt.sign(payload, 'supersecret123', { expiresIn: '24h' });
console.log('Valid JWT Token:');
console.log(token);
