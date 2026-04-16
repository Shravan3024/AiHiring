#!/bin/bash

# End-to-End Test Suite using Curl
# Tests all newly implemented endpoints
# Usage: bash tests/test-endpoints.sh YOUR_JWT_TOKEN APPLICATION_ID

TOKEN="${1:-YOUR_JWT_TOKEN}"
APP_ID="${2:-1}"
BASE_URL="http://localhost:5000/api"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}End-to-End API Test Suite${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}\n"

if [ "$TOKEN" = "YOUR_JWT_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  Using placeholder token. Tests will likely fail.${NC}"
    echo -e "${YELLOW}Usage: bash tests/test-endpoints.sh YOUR_JWT_TOKEN APPLICATION_ID${NC}\n"
fi

PASSED=0
FAILED=0

# Helper function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5

    echo -n "Testing: $description... "

    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    status=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$status" == "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS (HTTP $status)${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL (Expected $expected_status, got $status)${NC}"
        echo -e "${YELLOW}Response: $body${NC}"
        ((FAILED++))
        return 1
    fi
}

# ==================== ANALYTICS ENDPOINTS ====================
echo -e "${YELLOW}📊 Analytics Endpoints${NC}\n"

test_endpoint "GET" "/ai/analytics" "" "200" \
    "GET /api/ai/analytics"

test_endpoint "GET" "/ai/analytics?jobId=1" "" "200" \
    "GET /api/ai/analytics?jobId=1"

test_endpoint "POST" "/ai/analytics/export" '{"jobId":1}' "200" \
    "POST /api/ai/analytics/export"

echo ""

# ==================== HR APPLICATION ENDPOINTS ====================
echo -e "${YELLOW}👔 HR Application Endpoints${NC}\n"

test_endpoint "GET" "/hr/applications" "" "200" \
    "GET /hr/applications"

test_endpoint "GET" "/hr/applications/$APP_ID" "" "200" \
    "GET /hr/applications/:id"

echo ""

# ==================== HR ACTION ENDPOINTS ====================
echo -e "${YELLOW}📋 HR Action Endpoints${NC}\n"

test_endpoint "POST" "/hr/send-offer/$APP_ID" \
    '{"salary":1000000,"joining_date":"2026-05-01","designation":"Software Engineer"}' \
    "200" "POST /hr/send-offer/:id"

test_endpoint "POST" "/hr/send-rejection/$APP_ID" \
    '{"reason":"Did not meet requirements"}' \
    "200" "POST /hr/send-rejection/:id"

test_endpoint "POST" "/hr/schedule-interview/$APP_ID" \
    '{"interview_date":"2026-04-15","interview_time":"10:00 AM","interviewer":"HR Team"}' \
    "200" "POST /hr/schedule-interview/:id"

test_endpoint "POST" "/hr/add-note/$APP_ID" \
    '{"note":"Good candidate, proceed to next round"}' \
    "200" "POST /hr/add-note/:id"

echo ""

# ==================== AI ENDPOINTS ====================
echo -e "${YELLOW}🤖 AI Analysis Endpoints${NC}\n"

test_endpoint "GET" "/ai/analysis/$APP_ID" "" "200" \
    "GET /ai/analysis/:id"

echo ""

# ==================== ERROR CASES ====================
echo -e "${YELLOW}🚨 Error Handling${NC}\n"

test_endpoint "GET" "/ai/analytics" "" "401|403" \
    "Missing auth token (should error)"

test_endpoint "POST" "/hr/send-offer/99999" \
    '{"salary":1000000}' \
    "404|500" "Invalid application ID"

echo ""

# ==================== SUMMARY ====================
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}\n"

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $TOTAL"
echo "Success Rate: $PERCENTAGE%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}\n"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed${NC}\n"
    exit 1
fi
