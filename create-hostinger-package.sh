#!/bin/bash

# EdMarg Hostinger Deployment Package Creator
# This script builds the frontend and creates a zip file ready for Hostinger upload

set -e

echo "🚀 EdMarg Hostinger Deployment Package Creator"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: Please run this script from the EdMarg root directory${NC}"
    exit 1
fi

# Step 1: Check backend URL
echo -e "${YELLOW}📋 Step 1: Backend Configuration${NC}"
echo "Please enter your backend URL (e.g., https://edmarg-backend.onrender.com):"
read -p "Backend URL: " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}❌ Backend URL is required${NC}"
    exit 1
fi

# Step 2: Update frontend environment
echo -e "${YELLOW}📝 Step 2: Updating frontend environment...${NC}"
cat > frontend/.env.production << EOF
NEXT_PUBLIC_API_BASE_URL=${BACKEND_URL}/api/v1
NEXT_PUBLIC_BACKEND_URL=${BACKEND_URL}
NEXT_PUBLIC_APP_NAME=EdMarg
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=false
EOF
echo -e "${GREEN}✅ Environment configured${NC}"

# Step 3: Update next.config.ts for static export
echo -e "${YELLOW}🔧 Step 3: Configuring Next.js for static export...${NC}"
cat > frontend/next.config.ts << 'EOF'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  distDir: 'out',
};

export default nextConfig;
EOF
echo -e "${GREEN}✅ Next.js configured${NC}"

# Step 4: Install dependencies
echo -e "${YELLOW}📦 Step 4: Installing dependencies...${NC}"
cd frontend
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 5: Build frontend
echo -e "${YELLOW}🏗️  Step 5: Building frontend...${NC}"
npm run build
echo -e "${GREEN}✅ Build complete${NC}"

# Step 6: Create .htaccess
echo -e "${YELLOW}📄 Step 6: Creating .htaccess...${NC}"
cat > out/.htaccess << 'EOF'
# Enable Rewrite Engine
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Serve existing files and directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Route all other requests to index.html
  RewriteRule ^(.*)$ /index.html [L,QSA]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache Control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
</IfModule>
EOF
echo -e "${GREEN}✅ .htaccess created${NC}"

# Step 7: Create deployment info file
echo -e "${YELLOW}📋 Step 7: Creating deployment info...${NC}"
cat > out/DEPLOYMENT_INFO.txt << EOF
EdMarg Deployment Package
========================

Created: $(date)
Backend URL: ${BACKEND_URL}

Deployment Instructions:
1. Login to Hostinger hPanel (https://hpanel.hostinger.com)
2. Go to File Manager
3. Navigate to public_html folder
4. Delete all existing files
5. Upload edmarg-hostinger.zip
6. Extract the zip file
7. Move all files from extracted folder to public_html root
8. Verify .htaccess file exists
9. Set file permissions: 644 for files, 755 for folders
10. Enable SSL in Hostinger panel
11. Visit your domain to test

Backend Setup:
- Deploy backend to Render/Railway/Vercel
- Set environment variables (see HOSTINGER_DEPLOYMENT_GUIDE.md)
- Update FRONTEND_URL to your domain

Support:
- Documentation: See HOSTINGER_DEPLOYMENT_GUIDE.md
- Issues: Check browser console for errors
EOF
echo -e "${GREEN}✅ Deployment info created${NC}"

# Step 8: Create zip file
echo -e "${YELLOW}📦 Step 8: Creating zip file...${NC}"
cd out
zip -r ../../edmarg-hostinger.zip . -x "*.DS_Store"
cd ../..
echo -e "${GREEN}✅ Zip file created: edmarg-hostinger.zip${NC}"

# Step 9: Summary
echo ""
echo -e "${GREEN}🎉 Deployment package created successfully!${NC}"
echo ""
echo "📦 Package: edmarg-hostinger.zip"
echo "📏 Size: $(du -h edmarg-hostinger.zip | cut -f1)"
echo ""
echo "Next Steps:"
echo "1. Login to Hostinger File Manager"
echo "2. Upload edmarg-hostinger.zip to public_html"
echo "3. Extract the zip file"
echo "4. Configure SSL and test"
echo ""
echo "📖 Full instructions: HOSTINGER_DEPLOYMENT_GUIDE.md"
echo ""
