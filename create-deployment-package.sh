#!/bin/bash

# EdMarg - Create Deployment Package for Hostinger
# This script creates a clean ZIP file ready for upload

echo "📦 Creating deployment package for Hostinger..."

# Create temporary directory
TEMP_DIR="edmarg-deploy"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

echo "📋 Copying backend files..."
# Copy backend (exclude node_modules and unnecessary files)
mkdir -p $TEMP_DIR/backend
rsync -av --progress backend/ $TEMP_DIR/backend/ \
  --exclude 'node_modules' \
  --exclude '.env' \
  --exclude '.env.local' \
  --exclude '.env.development' \
  --exclude '.vercel' \
  --exclude '*.log' \
  --exclude '.DS_Store'

echo "📋 Copying frontend files..."
# Copy frontend (exclude node_modules, .next, and unnecessary files)
mkdir -p $TEMP_DIR/frontend
rsync -av --progress frontend/ $TEMP_DIR/frontend/ \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.env' \
  --exclude '.env.local' \
  --exclude '.env.development' \
  --exclude '.vercel' \
  --exclude '*.log' \
  --exclude '.DS_Store'

echo "📋 Copying deployment files..."
# Copy deployment scripts and documentation
cp deploy-hostinger.sh $TEMP_DIR/
cp HOSTINGER_QUICK_START.md $TEMP_DIR/
cp HOSTINGER_DEPLOYMENT.md $TEMP_DIR/
cp README.md $TEMP_DIR/

# Make deployment script executable
chmod +x $TEMP_DIR/deploy-hostinger.sh

echo "🗜️  Creating ZIP file..."
# Create ZIP file
zip -r edmarg-hostinger.zip $TEMP_DIR/

# Cleanup
rm -rf $TEMP_DIR

echo "✅ Done!"
echo ""
echo "📦 Package created: edmarg-hostinger.zip"
echo "📊 File size: $(du -h edmarg-hostinger.zip | cut -f1)"
echo ""
echo "🚀 Next steps:"
echo "   1. Upload edmarg-hostinger.zip to Hostinger"
echo "   2. Extract the ZIP file in public_html"
echo "   3. SSH into server and run: ./deploy-hostinger.sh"
echo ""
