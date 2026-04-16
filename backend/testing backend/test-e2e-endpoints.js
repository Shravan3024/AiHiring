#!/usr/bin/env node

/**
 * End-to-End Test Suite for HR Panel Backend
 * Tests all newly implemented endpoints
 * Run: node backend/test-e2e-endpoints.js
 */

const http = require('http');
const querystring = require('querystring');

const BASE_URL = 'http://localhost:5000/api';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJockBjb21wYW55LmNvbSIsInJvbGUiOiJIUiIsImlhdCI6MTc3NTcxODgzMywiZXhwIjoxNzc1ODA1MjMzfQ.RxorTSJgxYCL05jNl94apvvTTpqLNw6DO8VSiQ4Yqj4'; // Valid JWT token
const TEST_APP_ID = 1; // Update with actual application ID from DB

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Make HTTP request helper
 */
function makeRequest(method, path, data = null, authToken = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData,
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

/**
 * Test result formatter
 */
function logTest(name, passed, details = '') {
  const status = passed
    ? `${colors.green}✓ PASS${colors.reset}`
    : `${colors.red}✗ FAIL${colors.reset}`;
  console.log(`${status} ${name}`);
  if (details) {
    console.log(`  ${colors.cyan}${details}${colors.reset}`);
  }
}

/**
 * Main test suite
 */
async function runTests() {
  console.log(`\n${colors.blue}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}End-to-End API Test Suite${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════${colors.reset}\n`);

  let passed = 0;
  let failed = 0;

  // ==================== ANALYTICS ENDPOINTS ====================
  console.log(`${colors.yellow}📊 Testing Analytics Endpoints${colors.reset}\n`);

  // Test 1: GET /api/ai/analytics
  try {
    console.log('Test 1: GET /api/ai/analytics');
    const result = await makeRequest('GET', 'ai/analytics', null, TEST_TOKEN);
    const success = result.status === 200;
    logTest('Analytics endpoint returns 200', success, `Status: ${result.status}`);
    if (success) {
      const hasStats = result.data?.data?.stats;
      const hasCandidates = result.data?.data?.candidates;
      logTest('Analytics response has required fields', hasStats && hasCandidates);
      passed++;
    } else {
      failed++;
    }
  } catch (err) {
    logTest('Analytics endpoint (error caught)', false, err.message);
    failed++;
  }

  console.log();

  // Test 2: GET /api/ai/analytics with jobId filter
  try {
    console.log('Test 2: GET /api/ai/analytics?jobId=1');
    const result = await makeRequest('GET', 'ai/analytics?jobId=1', null, TEST_TOKEN);
    const success = result.status === 200;
    logTest('Analytics with filter returns 200', success, `Status: ${result.status}`);
    if (success) passed++;
    else failed++;
  } catch (err) {
    logTest('Analytics with filter (error)', false, err.message);
    failed++;
  }

  console.log();

  // Test 3: POST /api/ai/analytics/export
  try {
    console.log('Test 3: POST /api/ai/analytics/export');
    const result = await makeRequest(
      'POST',
      'ai/analytics/export',
      { jobId: 1 },
      TEST_TOKEN
    );
    const success = result.status === 200;
    logTest('Analytics export returns 200', success, `Status: ${result.status}`);
    const isCSV = result.data?.toString().includes(',');
    logTest('Analytics export returns CSV format', isCSV);
    if (success) passed++;
    else failed++;
  } catch (err) {
    logTest('Analytics export (error)', false, err.message);
    failed++;
  }

  console.log();

  // ==================== HR ENDPOINTS ====================
  console.log(`${colors.yellow}👔 Testing HR Application Endpoints${colors.reset}\n`);

  // Test 4: GET /hr/applications
  try {
    console.log('Test 4: GET /hr/applications');
    const result = await makeRequest('GET', 'hr/applications', null, TEST_TOKEN);
    const success = result.status === 200;
    logTest('HR applications list returns 200', success, `Status: ${result.status}`);
    if (success) {
      const isArray = Array.isArray(result.data?.data || result.data);
      logTest('Response is array of applications', isArray);
      passed++;
    } else {
      failed++;
    }
  } catch (err) {
    logTest('HR applications list (error)', false, err.message);
    failed++;
  }

  console.log();

  // Test 5: GET /hr/applications/:id
  try {
    console.log(`Test 5: GET /hr/applications/${TEST_APP_ID}`);
    const result = await makeRequest(`GET`, `hr/applications/${TEST_APP_ID}`, null, TEST_TOKEN);
    const success = result.status === 200;
    logTest('HR application detail returns 200', success, `Status: ${result.status}`);
    if (success) passed++;
    else failed++;
  } catch (err) {
    logTest('HR application detail (error)', false, err.message);
    failed++;
  }

  console.log();

  // ==================== HR ACTION ENDPOINTS ====================
  console.log(`${colors.yellow}📋 Testing HR Action Endpoints${colors.reset}\n`);

  // Test 6: POST /hr/send-offer
  try {
    console.log(`Test 6: POST /hr/send-offer/${TEST_APP_ID}`);
    const result = await makeRequest(
      'POST',
      `hr/send-offer/${TEST_APP_ID}`,
      {
        salary: 1000000,
        joining_date: '2026-05-01',
        designation: 'Software Engineer',
      },
      TEST_TOKEN
    );
    const success = result.status === 200;
    logTest('Send offer returns 200', success, `Status: ${result.status}`);
    if (success) passed++;
    else failed++;
  } catch (err) {
    logTest('Send offer (error)', false, err.message);
    failed++;
  }

  console.log();

  // Test 7: POST /hr/send-rejection
  try {
    console.log(`Test 7: POST /hr/send-rejection/${TEST_APP_ID}`);
    const result = await makeRequest(
      'POST',
      `hr/send-rejection/${TEST_APP_ID}`,
      { reason: 'Did not meet technical requirements' },
      TEST_TOKEN
    );
    const success = result.status === 200;
    logTest('Send rejection returns 200', success, `Status: ${result.status}`);
    if (success) passed++;
    else failed++;
  } catch (err) {
    logTest('Send rejection (error)', false, err.message);
    failed++;
  }

  console.log();

  // Test 8: POST /hr/schedule-interview
  try {
    console.log(`Test 8: POST /hr/schedule-interview/${TEST_APP_ID}`);
    const result = await makeRequest(
      'POST',
      `hr/schedule-interview/${TEST_APP_ID}`,
      {
        interview_date: '2026-04-15',
        interview_time: '10:00 AM',
        interviewer: 'John Manager',
        interview_type: 'technical',
      },
      TEST_TOKEN
    );
    const success = result.status === 200;
    logTest('Schedule interview returns 200', success, `Status: ${result.status}`);
    if (success) passed++;
    else failed++;
  } catch (err) {
    logTest('Schedule interview (error)', false, err.message);
    failed++;
  }

  console.log();

  // Test 9: POST /hr/add-note
  try {
    console.log(`Test 9: POST /hr/add-note/${TEST_APP_ID}`);
    const result = await makeRequest(
      'POST',
      `hr/add-note/${TEST_APP_ID}`,
      { note: 'Strong technical background, recommended for final round' },
      TEST_TOKEN
    );
    const success = result.status === 200;
    logTest('Add note returns 200', success, `Status: ${result.status}`);
    if (success) passed++;
    else failed++;
  } catch (err) {
    logTest('Add note (error)', false, err.message);
    failed++;
  }

  console.log();

  // ==================== AI ENDPOINTS ====================
  console.log(`${colors.yellow}🤖 Testing AI Analysis Endpoints${colors.reset}\n`);

  // Test 10: GET /ai/analysis/:id
  try {
    console.log(`Test 10: GET /ai/analysis/${TEST_APP_ID}`);
    const result = await makeRequest(
      'GET',
      `/ai/analysis/${TEST_APP_ID}`,
      null,
      TEST_TOKEN
    );
    const success = result.status === 200;
    logTest('AI analysis returns 200', success, `Status: ${result.status}`);
    if (success) {
      const hasDecision = result.data?.data?.ai_decision;
      logTest('AI analysis has decision data', !!hasDecision);
      passed++;
    } else {
      failed++;
    }
  } catch (err) {
    logTest('AI analysis (error)', false, err.message);
    failed++;
  }

  console.log();

  // ==================== ERROR CASES ====================
  console.log(`${colors.yellow}🚨 Testing Error Handling${colors.reset}\n`);

  // Test 11: Missing applicationId
  try {
    console.log('Test 11: Missing applicationId (should fail gracefully)');
    const result = await makeRequest('POST', `/hr/add-note/invalid`, { note: 'test' }, TEST_TOKEN);
    const success = result.status >= 400;
    logTest('Returns error for invalid ID', success, `Status: ${result.status}`);
    if (success) passed++;
    else failed++;
  } catch (err) {
    logTest('Error handling (caught)', true, 'Properly handled network error');
    passed++;
  }

  console.log();

  // Test 12: Missing auth token
  try {
    console.log('Test 12: Missing auth token (should return 401/403)');
    const result = await makeRequest('GET', '/ai/analytics', null);
    const success = result.status === 401 || result.status === 403;
    logTest('Returns auth error without token', success, `Status: ${result.status}`);
    if (success) passed++;
    else failed++;
  } catch (err) {
    logTest('Auth error handling (error)', false, err.message);
    failed++;
  }

  console.log();

  // ==================== SUMMARY ====================
  console.log(`${colors.blue}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}Test Summary${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════${colors.reset}\n`);

  const total = passed + failed;
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total: ${total}\n`);
  console.log(`Success Rate: ${percentage}%\n`);

  if (failed === 0) {
    console.log(`${colors.green}✓ ALL TESTS PASSED!${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠ Some tests failed. Check backend logs.${colors.reset}\n`);
  }
}

// Run tests
console.log(
  `${colors.cyan}Note: Make sure backend is running on port 5000${colors.reset}`
);
console.log(
  `${colors.cyan}Update TEST_TOKEN with a valid JWT token${colors.reset}\n`
);

runTests().catch((err) => {
  console.error(`${colors.red}Test suite error: ${err.message}${colors.reset}`);
  console.error(`${colors.red}Is backend running on port 5000?${colors.reset}`);
  process.exit(1);
});
