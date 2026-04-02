#!/bin/bash

# Environment Files Verification Script
# Checks all .env files for correct edmarg.com URLs

echo "🔍 Checking Environment Files for edmarg.com URLs"
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
    
    if grep -q "onrender.com" "$file" 2>/dev/null; then
        echo -e "${RED}  ❌ Found onrender.com URL${NC}"
        grep "onrender.com" "$file"
        ((ERRORS++))
    fi
    
    # Check for edmarg.com
    if grep -q "edmarg.com" "$file" 2>/dev/null; then
        echo -e "${GREEN}  ✅ Contains edmarg.com${NC}"
    else
        echo -e "${YELLOW}  ⚠️  No edmarg.com found${NC}"
        ((WARNINGS++))
    fi
    
    echo ""
}

echo "📁 Backend Environment Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "backend/.env" "edmarg.com"
check_file "backend/.env.production" "edmarg.com"
check_file "backend/.env.staging" "staging.edmarg.com"

echo "📁 Frontend Environment Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "frontend/.env.production" "edmarg.com"
check_file "frontend/.env.staging" "staging.edmarg.com"

echo "📁 Backend CORS Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "backend/lib/withCors.js" "edmarg.com"
check_file "backend/server.js" "edmarg.com"

echo "📁 Deployment Templates"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "deployment/backend.env.production" "edmarg.com"
check_file "deployment/frontend.env.production" "edmarg.com"

echo "=================================================="
echo "📊 Summary"
echo "=================================================="
echo -e "Errors: ${RED}${ERRORS}${NC}"
echo -e "Warnings: ${YELLOW}${WARNINGS}${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All environment files are correctly configured!${NC}"
    echo ""
    echo "Ready to deploy to Hostinger!"
    exit 0
else
    echo -e "${RED}❌ Please fix the errors above before deploying${NC}"
    echo ""
    echo "Run this script again after fixing the issues."
    exit 1
fi
