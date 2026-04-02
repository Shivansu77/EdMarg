#!/bin/bash

# EdMarg Deployment Verification Script
# Run this after deployment to verify everything works

echo "🔍 EdMarg Deployment Verification"
echo "=================================="
echo ""

DOMAIN="https://edmarg.com"
BACKEND_PORT=5000
FRONTEND_PORT=3000

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing ${name}... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "${url}" 2>/dev/null)
    
    if [ "$response" = "$expected" ]; then
        echo -e "${GREEN}✅ PASSED${NC} (HTTP ${response})"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} (Expected ${expected}, got ${response})"
        ((FAILED++))
    fi
}

# Test backend locally
echo "${YELLOW}1. Testing Backend (Local)${NC}"
test_endpoint "Backend Status" "http://localhost:${BACKEND_PORT}/api/status" "200"
echo ""

# Test frontend locally
echo "${YELLOW}2. Testing Frontend (Local)${NC}"
test_endpoint "Frontend Home" "http://localhost:${FRONTEND_PORT}" "200"
echo ""

# Test public domain
echo "${YELLOW}3. Testing Public Domain${NC}"
test_endpoint "Domain Root" "${DOMAIN}" "200"
test_endpoint "Backend API Status" "${DOMAIN}/api/status" "200"
test_endpoint "Backend API v1" "${DOMAIN}/api/v1/users/login" "400"  # 400 is expected without credentials
echo ""

# Test MongoDB connection
echo "${YELLOW}4. Testing MongoDB Connection${NC}"
echo -n "MongoDB Connection... "
cd ~/backend 2>/dev/null || cd /Users/bishtshivansugmail.com/Desktop/EdMarg/backend
mongo_test=$(node -e "require('dotenv').config(); require('./lib/db')().then(() => console.log('SUCCESS')).catch(() => console.log('FAILED'));" 2>&1)
if [[ $mongo_test == *"SUCCESS"* ]]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi
echo ""

# Test CORS headers
echo "${YELLOW}5. Testing CORS Headers${NC}"
echo -n "CORS Headers... "
cors_header=$(curl -s -H "Origin: https://edmarg.com" -I "${DOMAIN}/api/status" 2>/dev/null | grep -i "access-control-allow-origin")
if [[ $cors_header == *"edmarg.com"* ]]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    echo "   ${cors_header}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "   CORS header not found or incorrect"
    ((FAILED++))
fi
echo ""

# Test SSL certificate
echo "${YELLOW}6. Testing SSL Certificate${NC}"
echo -n "HTTPS Certificate... "
ssl_test=$(curl -s -I "${DOMAIN}" 2>&1 | head -n 1)
if [[ $ssl_test == *"200"* ]] || [[ $ssl_test == *"301"* ]] || [[ $ssl_test == *"302"* ]]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi
echo ""

# Check environment variables
echo "${YELLOW}7. Checking Environment Variables${NC}"
if [ -f ~/backend/.env ] || [ -f /Users/bishtshivansugmail.com/Desktop/EdMarg/backend/.env ]; then
    echo -n "Backend .env... "
    echo -e "${GREEN}✅ EXISTS${NC}"
    ((PASSED++))
else
    echo -n "Backend .env... "
    echo -e "${RED}❌ MISSING${NC}"
    ((FAILED++))
fi

if [ -f ~/public_html/.env.production ] || [ -f /Users/bishtshivansugmail.com/Desktop/EdMarg/frontend/.env.production ]; then
    echo -n "Frontend .env.production... "
    echo -e "${GREEN}✅ EXISTS${NC}"
    ((PASSED++))
else
    echo -n "Frontend .env.production... "
    echo -e "${RED}❌ MISSING${NC}"
    ((FAILED++))
fi
echo ""

# Check processes
echo "${YELLOW}8. Checking Running Processes${NC}"
if command -v pm2 &> /dev/null; then
    pm2_status=$(pm2 list 2>/dev/null | grep -E "edmarg|online")
    if [[ $pm2_status == *"online"* ]]; then
        echo -e "${GREEN}✅ PM2 processes running${NC}"
        pm2 list
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️  No PM2 processes found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  PM2 not installed${NC}"
fi
echo ""

# Summary
echo "=================================="
echo "📊 VERIFICATION SUMMARY"
echo "=================================="
echo -e "Passed: ${GREEN}${PASSED}${NC}"
echo -e "Failed: ${RED}${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Deployment successful!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please review the errors above.${NC}"
    exit 1
fi
