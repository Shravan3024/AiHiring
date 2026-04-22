const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function checkAnalytics() {
  try {
    const tokenScript = fs.readFileSync(path.join(__dirname, 'scratch', 'check_session.js'), 'utf8');
    // Extract token logic from check_session or use direct DB query
    const { User, Application, AIDecision } = require('./src/models');
    
    // First let's just try running the query directly using the controller logic
    console.log("Testing AIDecision query...");
    const decisions = await AIDecision.findAll({
      order: [['created_at', 'DESC']],
      limit: 1
    });
    console.log("Query successful, found:", decisions.length);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkAnalytics();
