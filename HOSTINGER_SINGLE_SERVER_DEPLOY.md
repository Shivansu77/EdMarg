# 🚀 HOSTINGER DEPLOYMENT - BOTH FRONTEND & BACKEND

## Complete Guide for Deploying EdMarg on Hostinger

**Domain**: https://edmarg.com  
**Server**: Hostinger (Single Server)  
**Backend**: Node.js app (Port 5000)  
**Frontend**: Next.js app (Port 3000)  
**Database**: MongoDB Atlas

---

## 📋 BEFORE YOU START

### Required Information:
```
[ ] SSH Username: u_____________
[ ] SSH Server IP: ___.___.___.___
[ ] MongoDB URI: mongodb+srv://edMarg:kickBash11@cluster0.rdlmzjw.mongodb.net/edmarg_db
[ ] JWT Secret: (generate below)
```

### Generate JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🎯 DEPLOYMENT STEPS

### STEP 1: Connect to Server

```bash
ssh u123456789@YOUR_SERVER_IP
```

After login:
```bash
pwd
ls -la
```

---

### STEP 2: Clean Old Deployment

```bash
# Clean frontend
cd ~/public_html
rm -rf * .[!.]*

# Clean backend
cd ~
rm -rf backend

# Verify
ls -la ~/public_html
ls -la ~
```

---

### STEP 3: Build Frontend Locally

**On your local machine** (not on server):

```bash
cd /Users/bishtshivansugmail.com/Desktop/EdMarg/frontend
npm run build
```

Wait for build to complete.

---

### STEP 4: Create Deployment Packages

**On your local machine**:

```bash
cd /Users/bishtshivansugmail.com/Desktop/EdMarg

# Package backend
tar -czf backend.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.env.local' \
  --exclude='.vercel' \
  backend/

# Package frontend
tar -czf frontend.tar.gz \
  -C frontend \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.vercel' \
  .next/ public/ src/ package.json package-lock.json next.config.ts tsconfig.json
```

---

### STEP 5: Upload to Server

**On your local machine**:

```bash
scp backend.tar.gz u123456789@YOUR_SERVER_IP:~/
scp frontend.tar.gz u123456789@YOUR_SERVER_IP:~/
```

---

### STEP 6: Extract Files on Server

**Back on SSH**:

```bash
# Extract backend
cd ~
tar -xzf backend.tar.gz
rm backend.tar.gz

# Extract frontend
cd ~/public_html
tar -xzf ~/frontend.tar.gz
rm ~/frontend.tar.gz

# Verify
ls -la ~/backend
ls -la ~/public_html
```

---

### STEP 7: Configure Backend

```bash
cd ~/backend

# Create .env file
cat > .env << 'EOF'
DB_NAME=edmarg_db
PORT=5000
MONGODB_URI=mongodb+srv://edMarg:kickBash11@cluster0.rdlmzjw.mongodb.net/edmarg_db?appName=Cluster0
JWT_SECRET=REPLACE_WITH_YOUR_GENERATED_SECRET_32_CHARS_MINIMUM
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=https://edmarg.com
NODE_ENV=production
LOG_LEVEL=info

ZOOM_ACCOUNT_ID=DHOhKpXqRWiyLL617hUBGg
ZOOM_CLIENT_ID=e9YVhlodSIeunHqTl7cw0A
ZOOM_CLIENT_SECRET=7Ks9MiwVcfW0iF9V6unoKYelhuwdttiq
ZOOM_WEBHOOK_SECRET=YDwZFMaFRg-u6tXpzM_jAw
EOF

# IMPORTANT: Edit the JWT_SECRET
nano .env
# Replace JWT_SECRET with your generated secret
# Save: Ctrl+O, Enter, Ctrl+X

# Install dependencies
npm install --production
```

---

### STEP 8: Configure Frontend

```bash
cd ~/public_html

# Create .env.production
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://edmarg.com/api/v1
NEXT_PUBLIC_API_BASE_URL=https://edmarg.com
NEXT_PUBLIC_BACKEND_URL=https://edmarg.com
NEXT_PUBLIC_APP_NAME=EdMarg
NEXT_PUBLIC_APP_URL=https://edmarg.com
NEXT_PUBLIC_ENVIRONMENT=production
EOF

# Install dependencies
npm install --production

# Build (if not already built)
npm run build
```

---

### STEP 9: Configure Apache (.htaccess)

```bash
cd ~/public_html

cat > .htaccess << 'EOF'
# Enable Rewrite Engine
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Proxy API requests to backend (port 5000)
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]

# Proxy all other requests to Next.js frontend (port 3000)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# CORS Headers
Header always set Access-Control-Allow-Origin "https://edmarg.com"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
Header always set Access-Control-Allow-Credentials "true"

# Security Headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
EOF
```

---

### STEP 10: Setup Backend in Hostinger hPanel

1. Open browser → https://hpanel.hostinger.com
2. Login to your account
3. Go to: **Advanced** → **Node.js**
4. Click **Create Application**
5. Configure:
   - **Application root**: `backend`
   - **Application startup file**: `server.js`
   - **Node.js version**: `20.x` or `22.x`
   - **Application mode**: `production`
6. Click **Create**
7. Wait for setup to complete
8. Click **Restart**

✅ Backend is now running on port 5000

---

### STEP 11: Start Frontend with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start frontend
cd ~/public_html
pm2 start npm --name "edmarg-frontend" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on server reboot
pm2 startup
# Copy and run the command it outputs
```

✅ Frontend is now running on port 3000

---

### STEP 12: Seed Admin User

```bash
cd ~/backend
node scripts/seedAdmin.js
```

**Admin Credentials:**
- Email: `admin@edmarg.com`
- Password: `Admin@123`

---

### STEP 13: Verify Deployment

#### Test Backend Locally:
```bash
curl http://localhost:5000/api/status
```
Expected: `{"status":"success","message":"Backend is running"}`

#### Test Frontend Locally:
```bash
curl http://localhost:3000
```
Expected: HTML content

#### Test Public Domain:
```bash
curl https://edmarg.com
curl https://edmarg.com/api/status
```

#### Test in Browser:
1. Open https://edmarg.com
2. Open DevTools (F12) → Console
3. Check for errors (should be none)
4. Go to login page
5. Login with: `admin@edmarg.com` / `Admin@123`
6. Check Network tab → No CORS errors
7. Check Application → Cookies → Auth token should be set

---

## ✅ SUCCESS CRITERIA

- [x] https://edmarg.com loads
- [x] https://edmarg.com/api/status returns success
- [x] Login works
- [x] No CORS errors
- [x] Cookies stored correctly
- [x] MongoDB connected

---

## 🔧 TROUBLESHOOTING

### Backend Not Responding

```bash
# Check Hostinger hPanel
# Go to: Advanced → Node.js → Restart

# Check logs
cd ~/backend
npm start
# Look for errors
```

### Frontend Not Responding

```bash
# Check PM2 status
pm2 list

# Check logs
pm2 logs edmarg-frontend

# Restart
pm2 restart edmarg-frontend
```

### CORS Errors

```bash
# Verify CORS configuration
nano ~/backend/lib/withCors.js
# Ensure 'https://edmarg.com' is in ALLOWED_ORIGINS

nano ~/backend/server.js
# Ensure 'https://edmarg.com' is in ALLOWED_ORIGINS

# Restart backend via Hostinger hPanel
```

### MongoDB Connection Failed

```bash
# Test connection
cd ~/backend
node -e "require('dotenv').config(); require('./lib/db')();"

# If fails:
# 1. Check MONGODB_URI in .env
# 2. Go to MongoDB Atlas → Network Access
# 3. Add Hostinger server IP to whitelist
# 4. Or temporarily use 0.0.0.0/0
```

### 404 Errors on API

```bash
# Check .htaccess
nano ~/public_html/.htaccess

# Verify proxy rules are correct
# Restart Apache (via Hostinger hPanel)
```

---

## 🔄 UPDATE DEPLOYMENT

### Update Backend:
```bash
# On local machine
cd /Users/bishtshivansugmail.com/Desktop/EdMarg
tar -czf backend.tar.gz --exclude='node_modules' backend/
scp backend.tar.gz u123456789@YOUR_SERVER_IP:~/

# On server
cd ~
rm -rf backend
tar -xzf backend.tar.gz
cd backend
npm install --production
# Restart via Hostinger hPanel
```

### Update Frontend:
```bash
# On local machine
cd /Users/bishtshivansugmail.com/Desktop/EdMarg/frontend
npm run build
tar -czf frontend.tar.gz --exclude='node_modules' .next/ public/ src/ package*.json *.ts
scp frontend.tar.gz u123456789@YOUR_SERVER_IP:~/

# On server
cd ~/public_html
rm -rf .next src public
tar -xzf ~/frontend.tar.gz
npm install --production
pm2 restart edmarg-frontend
```

---

## 📊 MONITORING

### Check Running Processes:
```bash
pm2 list
```

### View Logs:
```bash
# Frontend logs
pm2 logs edmarg-frontend

# Backend logs (via Hostinger hPanel)
# Or check error logs
tail -f ~/logs/error.log
```

### Monitor Resources:
```bash
pm2 monit
```

---

## 🛡️ SECURITY CHECKLIST

- [x] HTTPS enforced
- [x] CORS restricted to edmarg.com
- [x] Strong JWT secret (32+ chars)
- [x] MongoDB IP whitelist configured
- [x] Secure cookies enabled
- [x] Rate limiting enabled
- [x] Helmet security headers enabled

---

## 📞 IMPORTANT URLS

- **Production**: https://edmarg.com
- **API Status**: https://edmarg.com/api/status
- **Login API**: https://edmarg.com/api/v1/users/login
- **Hostinger hPanel**: https://hpanel.hostinger.com
- **MongoDB Atlas**: https://cloud.mongodb.com

---

## 🎯 QUICK COMMANDS REFERENCE

```bash
# Check backend status
curl http://localhost:5000/api/status

# Check frontend status
curl http://localhost:3000

# Check public site
curl https://edmarg.com

# Restart frontend
pm2 restart edmarg-frontend

# View frontend logs
pm2 logs edmarg-frontend

# Check PM2 processes
pm2 list

# Test MongoDB connection
cd ~/backend && node -e "require('dotenv').config(); require('./lib/db')();"
```

---

## ✨ DEPLOYMENT COMPLETE!

Your EdMarg application is now running on Hostinger:
- Backend: Running via Hostinger Node.js app (port 5000)
- Frontend: Running via PM2 (port 3000)
- Domain: https://edmarg.com
- Database: MongoDB Atlas

**Test it now**: https://edmarg.com

🎉 Congratulations!
