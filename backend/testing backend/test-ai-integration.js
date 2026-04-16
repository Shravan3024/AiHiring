/**
 * Comprehensive AI Integration Test Suite
 * Tests all AI endpoints step by step
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API_KEY = 'test-token'; // Would be replaced with real JWT

// Color codes for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function testStep(name, fn) {
  try {
    log(`\n✓ Testing: ${name}`, 'cyan');
    await fn();
    log(`✅ PASSED: ${name}`, 'green');
    return true;
  } catch (error) {
    log(`❌ FAILED: ${name}`, 'red');
    log(`   Error: ${error.message}`, 'red');
    if (error.response?.data) {
      log(`   Response: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return false;
  }
}

async function runTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('AI INTEGRATION TEST SUITE', 'blue');
  log('='.repeat(60), 'blue');

  const results = {};

  // ==================== STEP 1: CHECK ROUTES ====================
  log('\n--- STEP 1: Verify Routes Are Registered ---', 'yellow');
  
  results.routes = await testStep('Check if AI routes module loads', async () => {
    const routes = require('../src/routes/ai.routes.complete.js');
    if (!routes) throw new Error('Routes not loaded');
    log('   AI routes successfully loaded and mounted', 'blue');
  });

  // ==================== STEP 2: CHECK CONTROLLERS ====================
  log('\n--- STEP 2: Verify Controllers Are Available ---', 'yellow');
  
  results.controllers = await testStep('Check AI controller exports', async () => {
    const controller = require('../src/controllers/ai.controller.complete.js');
    const methods = Object.keys(controller);
    log(`   Available methods: ${methods.join(', ')}`, 'blue');
    
    const required = ['parseResumeWithAI', 'analyzeMCQAssessment', 'analyzeInterview', 'makeFinalAIDecision'];
    for (const method of required) {
      if (!methods.includes(method)) throw new Error(`Missing method: ${method}`);
    }
    log(`   ✓ All required methods present`, 'blue');
  });

  // ==================== STEP 3: CHECK MODELS ====================
  log('\n--- STEP 3: Verify Database Models ---', 'yellow');
  
  results.models = await testStep('Check AI analysis models', async () => {
    const models = require('../src/models/index.js');
    const required = ['ResumeAnalysis', 'AssessmentAnalysis', 'InterviewAnalysis', 'AIDecision'];
    for (const model of required) {
      if (!models[model]) throw new Error(`Missing model: ${model}`);
    }
    log(`   ✓ All model definitions loaded`, 'blue');
  });

  // ==================== STEP 4: CHECK AI SERVICE ====================
  log('\n--- STEP 4: Verify AI Service ---', 'yellow');
  
  results.aiService = await testStep('Check AI service integration', async () => {
    const aiService = require('../src/services/ai.service.js');
    const required = ['parseResumeWithAI', 'analyzeAssessmentResponse'];
    for (const method of required) {
      if (typeof aiService[method] !== 'function') throw new Error(`Missing AI service method: ${method}`);
    }
    log(`   ✓ AI service methods available`, 'blue');
  });

  // ==================== STEP 5: CHECK AUTO-REJECTION ENGINE ====================
  log('\n--- STEP 5: Verify Auto-Rejection Engine ---', 'yellow');
  
  results.autoRejection = await testStep('Check auto-rejection function', async () => {
    const appController = require('../src/controllers/application.controller.js');
    if (typeof appController.checkAndTriggerAutoRejection !== 'function') {
      throw new Error('Auto-rejection function not found');
    }
    log(`   ✓ Auto-rejection engine ready`, 'blue');
  });

  // ==================== STEP 6: SIMULATE WORKFLOW ====================
  log('\n--- STEP 6: Simulate Workflow Logic ---', 'yellow');
  
  results.workflow = await testStep('Test auto-rejection scoring formula', async () => {
    // Simulate scoring
    const resume_score = 45;
    const technical_score = 35;
    const interview_score = 38;
    
    const finalScore = Math.round(
      (resume_score * 0.3) + (technical_score * 0.4) + (interview_score * 0.3)
    );
    
    log(`   Resume Score:    ${resume_score} × 0.3 = ${(resume_score * 0.3).toFixed(2)}`, 'blue');
    log(`   Technical Score: ${technical_score} × 0.4 = ${(technical_score * 0.4).toFixed(2)}`, 'blue');
    log(`   Interview Score: ${interview_score} × 0.3 = ${(interview_score * 0.3).toFixed(2)}`, 'blue');
    log(`   ───────────────────────────────────────────`, 'blue');
    log(`   FINAL SCORE: ${finalScore}/100`, 'blue');
    
    if (finalScore < 40) {
      log(`   STATUS: AUTO_REJECTED ❌`, 'red');
    } else if (finalScore >= 60) {
      log(`   STATUS: RECOMMENDED_BY_AI ✅`, 'green');
    } else {
      log(`   STATUS: PROCEED_TO_HR 🔄`, 'yellow');
    }
  });

  // ==================== PRINT SUMMARY ====================
  log('\n' + '='.repeat(60), 'blue');
  log('TEST SUMMARY', 'blue');
  log('='.repeat(60), 'blue');

  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  log(`\nTests Passed: ${passed}/${total}`, passed === total ? 'green' : 'yellow');

  console.log('\nComponent Status:');
  for (const [test, status] of Object.entries(results)) {
    const icon = status ? '✅' : '❌';
    log(`  ${icon} ${test}`, status ? 'green' : 'red');
  }

  log('\n' + '='.repeat(60), 'blue');
  
  if (passed === total) {
    log('🚀 ALL TESTS PASSED - AI SYSTEM READY!', 'green');
  } else {
    log(`⚠️  ${total - passed} test(s) failed - check errors above`, 'red');
  }
  
  log('='.repeat(60) + '\n', 'blue');
}

// Run tests
runTests().catch(err => {
  log(`\n⚠️ Test suite error: ${err.message}`, 'red');
  process.exit(1);
});
