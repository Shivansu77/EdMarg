#!/bin/bash

# EdMarg Hostinger Deployment Script
# Run this script after uploading files to Hostinger via SSH

echo "🚀 Starting EdMarg Deployment on Hostinger..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get user input
read -p "Enter your MongoDB connection string: " MONGODB_URI
read -p "Enter your domain (e.g., yourdomain.com): " DOMAIN

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32)

echo -e "${YELLOW}Installing dependencies...${NC}"

# Backend setup
cd backend
cat > .env << EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=$MONGODB_URI
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=https://$DOMAIN
LOG_LEVEL=info
EOF

npm install --production
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Frontend setup
cd ../frontend
cat > .env.production << EOF
NEXT_PUBLIC_API_BASE_URL=https://$DOMAIN/api/v1
NEXT_PUBLIC_BACKEND_URL=https://$DOMAIN
NEXT_PUBLIC_APP_NAME=EdMarg
NEXT_PUBLIC_ENVIRONMENT=production
EOF

npm install
npm run build
echo -e "${GREEN}✓ Frontend built successfully${NC}"

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installing PM2...${NC}"
    npm install -g pm2
fi

# Start services
cd ../backend
pm2 delete edmarg-backend 2>/dev/null
pm2 start server.js --name edmarg-backend
echo -e "${GREEN}✓ Backend started${NC}"

cd ../frontend
pm2 delete edmarg-frontend 2>/dev/null
pm2 start npm --name edmarg-frontend -- start
echo -e "${GREEN}✓ Frontend started${NC}"

# Save PM2 configuration
pm2 save
pm2 startup

# Seed data
cd ../backend
npm run seed:admin
npm run seed:assessments

echo -e "${GREEN}✓ Initial data seeded${NC}"

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Your website is running at:"
echo "  Frontend: https://$DOMAIN"
echo "  Backend:  https://$DOMAIN/api/v1"
echo ""
echo "PM2 Commands:"
echo "  pm2 status       - Check status"
echo "  pm2 logs         - View logs"
echo "  pm2 restart all  - Restart services"
echo ""
echo "⚠️  Don't forget to:"
echo "  1. Configure Nginx/Apache reverse proxy"
echo "  2. Setup SSL certificate"
echo "  3. Configure firewall"
