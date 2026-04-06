#!/bin/bash

# EdMarg Frontend Hostinger public_html Deployment Package
# Run this from the project root

set -e

echo "🚀 Building Next.js Frontend for Hostinger public_html"

cd frontend

# Build the frontend (without static export)
echo "📦 Building project..."
npm run build

echo "🗜️ Creating deployment zip..."
# Remove old zip if exists
rm -f ../hostinger-frontend.zip

# Create a zip containing the essential files needed for production routing
if command -v zip &> /dev/null; then
    zip -r ../hostinger-frontend.zip .next public package.json package-lock.json next.config.ts server.js postcss.config.mjs tailwind.config.ts eslint.config.mjs tsconfig.json .env.production
else
    # Fallback to tar if zip is not available (macOS often has zip)
    tar -czf ../hostinger-frontend.tar.gz .next/ public/ package.json package-lock.json next.config.ts server.js postcss.config.mjs eslint.config.mjs tsconfig.json .env.production
fi

echo "✅ Deployment package created!"
if [ -f ../hostinger-frontend.zip ]; then
    echo "📁 Package location: hostinger-frontend.zip"
else
    echo "📁 Package location: hostinger-frontend.tar.gz"
fi

echo ""
echo "==== DEPLOYMENT INSTRUCTIONS FOR HOSTINGER ===="
echo "1. Go to your Hostinger hPanel -> Node.js Section."
echo "2. Create a new Node.js App with:"
echo "   - Application Root: /public_html"
echo "   - Application Startup file: server.js"
echo "3. Go to File Manager -> public_html and delete everything inside it."
echo "4. Upload the created hostinger-frontend zip/tar file into public_html and extract it."
echo "5. Edit the .env.production file in File Manager to add your ENV variables and save as .env."
echo "6. Go back to Node.js App section and click 'Stop App', then 'NPM install', and finally 'Start App'."
