require('dotenv').config();
const { AdminWorkflow, AIConfig, Notification, ApprovalRule } = require('./src/models/index.js');

async function test() {
  try {
    console.log('Testing AdminWorkflow...');
    await AdminWorkflow.findAll({ order: [["created_at", "DESC"]] });
    console.log('AdminWorkflow OK');
  } catch (e) {
    console.error('AdminWorkflow ERROR:', e.message);
  }

  try {
    console.log('Testing AIConfig...');
    await AIConfig.findAll({ order: [["created_at", "DESC"]] });
    console.log('AIConfig OK');
  } catch (e) {
    console.error('AIConfig ERROR:', e.message);
  }

  try {
    console.log('Testing Notification...');
    await Notification.findAll({ order: [["created_at", "DESC"]] });
    console.log('Notification OK');
  } catch (e) {
    console.error('Notification ERROR:', e.message);
  }

  try {
    console.log('Testing ApprovalRule...');
    if (ApprovalRule) {
       await ApprovalRule.findAll();
       console.log('ApprovalRule OK');
    } else {
       console.log('ApprovalRule Model not found!');
    }
  } catch (e) {
    console.error('ApprovalRule ERROR:', e.message);
  }
}

test().then(() => process.exit(0));
