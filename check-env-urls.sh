#!/bin/bash

# Environment Files Verification Script
# Checks all .env files for correct onrender.com URLs

echo "🔍 Checking Environment Files for Render URLs"
echo "=================================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# Function to check file
check_file() {
    local file=$1
    local expected_url=$2
    
    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠️  $file - NOT FOUND${NC}"
        ((WARNINGS++))
        return
    fi
    
    echo "Checking: $file"
    
    # Check for old URLs
    if grep -q "vercel.app" "$file" 2>/dev/null; then
        echo -e "${RED}  ❌ Found vercel.app URL${NC}"
        grep "vercel.app" "$file"
        ((ERRORS++))
    fi
    
    # Check for expected Render URL
    if grep -q "$expected_url" "$file" 2>/dev/null; then
        echo -e "${GREEN}  ✅ Contains expected URL ($expected_url)${NC}"
    else
        echo -e "${YELLOW}  ⚠️  Expected URL not found: $expected_url${NC}"
        ((WARNINGS++))
    fi
    
    echo ""
}

echo "📁 Backend Environment Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "backend/.env" "edmarg.onrender.com"
check_file "backend/.env.production" "edmarg.onrender.com"
check_file "backend/.env.staging" "staging.edmarg.com"

echo "📁 Frontend Environment Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "frontend/.env.production" "edmarg.onrender.com"
check_file "frontend/.env.staging" "staging.edmarg.com"

echo "📁 Backend CORS Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "backend/lib/withCors.js" "edmarg.onrender.com"
check_file "backend/server.js" "edmarg.onrender.com"

echo "📁 Deployment Templates"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "deployment/backend.env.production" "edmarg.onrender.com"
check_file "deployment/frontend.env.production" "edmarg.onrender.com"

echo "=================================================="
echo "📊 Summary"
echo "=================================================="
echo -e "Errors: ${RED}${ERRORS}${NC}"
echo -e "Warnings: ${YELLOW}${WARNINGS}${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All environment files are correctly configured!${NC}"
    echo ""
    echo "Ready to deploy to Render!"
    exit 0
else
    echo -e "${RED}❌ Please fix the errors above before deploying${NC}"
    echo ""
    echo "Run this script again after fixing the issues."
    exit 1
fi
