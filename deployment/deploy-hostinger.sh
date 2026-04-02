#!/bin/bash

# EdMarg Hostinger Deployment Script
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 EdMarg Hostinger Deployment Script"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
read -p "Enter SSH username (e.g., u123456789): " SSH_USER
read -p "Enter server IP: " SERVER_IP
SSH_HOST="${SSH_USER}@${SERVER_IP}"

echo ""
echo "${YELLOW}📋 Deployment Configuration:${NC}"
echo "   SSH Host: ${SSH_HOST}"
echo "   Domain: https://edmarg.com"
echo ""

# Step 1: Build frontend locally
echo "${YELLOW}Step 1: Building frontend locally...${NC}"
cd frontend
npm run build
cd ..
echo "${GREEN}✅ Frontend built successfully${NC}"
echo ""

# Step 2: Create deployment packages
echo "${YELLOW}Step 2: Creating deployment packages...${NC}"

# Backend package
tar -czf /tmp/edmarg-backend.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.env' \
  backend/

# Frontend package
tar -czf /tmp/edmarg-frontend.tar.gz \
  -C frontend \
  --exclude='node_modules' \
  .next/ public/ src/ package.json package-lock.json next.config.ts tsconfig.json

echo "${GREEN}✅ Packages created${NC}"
echo ""

# Step 3: Upload to server
echo "${YELLOW}Step 3: Uploading to server...${NC}"
scp /tmp/edmarg-backend.tar.gz ${SSH_HOST}:~/
scp /tmp/edmarg-frontend.tar.gz ${SSH_HOST}:~/
scp deployment/backend.env.production ${SSH_HOST}:~/backend.env
scp deployment/frontend.env.production ${SSH_HOST}:~/frontend.env
scp deployment/.htaccess ${SSH_HOST}:~/htaccess.tmp
echo "${GREEN}✅ Files uploaded${NC}"
echo ""

# Step 4: Deploy on server
echo "${YELLOW}Step 4: Deploying on server...${NC}"

ssh ${SSH_HOST} << 'ENDSSH'
set -e

echo "🧹 Cleaning old files..."
cd ~/public_html
rm -rf * .[!.]* 2>/dev/null || true

cd ~
rm -rf backend 2>/dev/null || true

echo "📦 Extracting backend..."
tar -xzf edmarg-backend.tar.gz
rm edmarg-backend.tar.gz

echo "📦 Extracting frontend..."
cd ~/public_html
tar -xzf ~/edmarg-frontend.tar.gz
rm ~/edmarg-frontend.tar.gz

echo "⚙️  Configuring backend..."
cd ~/backend
mv ~/backend.env .env

echo "⚠️  IMPORTANT: Edit ~/backend/.env and set:"
echo "   - MONGODB_URI"
echo "   - JWT_SECRET"

npm install --production

echo "⚙️  Configuring frontend..."
cd ~/public_html
mv ~/frontend.env .env.production
mv ~/htaccess.tmp .htaccess

npm install --production

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit ~/backend/.env with your MongoDB URI and JWT secret"
echo "   2. Configure Node.js app in Hostinger hPanel:"
echo "      - Application root: backend"
echo "      - Startup file: server.js"
echo "      - Node version: 20.x or 22.x"
echo "   3. Start frontend: cd ~/public_html && npm start"
echo "   4. Seed admin: cd ~/backend && node scripts/seedAdmin.js"
echo ""
ENDSSH

echo ""
echo "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "${YELLOW}📝 Manual steps required:${NC}"
echo "   1. SSH into server: ssh ${SSH_HOST}"
echo "   2. Edit backend/.env with MongoDB credentials"
echo "   3. Configure Node.js app in Hostinger hPanel"
echo "   4. Start frontend: cd ~/public_html && npm start"
echo "   5. Seed admin user: cd ~/backend && node scripts/seedAdmin.js"
echo ""
echo "${GREEN}🎉 Done!${NC}"
