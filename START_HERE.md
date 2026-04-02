# 🎯 YOUR ACTION ITEMS - START HERE

## ✅ COMPLETED (By Me)

- [x] Updated all URLs from edmarg.onrender.com → edmarg.com
- [x] Fixed CORS configuration for production
- [x] Created deployment documentation
- [x] Created deployment scripts
- [x] Created verification scripts
- [x] Prepared environment file templates

---

## 📝 YOUR TODO LIST (Before Deployment)

### 1. Gather Required Information

You need these before starting:

```
[ ] SSH Username: u_____________
[ ] SSH Server IP: ___.___.___.___
[ ] MongoDB URI: mongodb+srv://_______________
[ ] JWT Secret: ________________________________ (32+ chars)
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Verify MongoDB Atlas Setup

- [ ] Login to https://cloud.mongodb.com
- [ ] Database user created with password
- [ ] Get connection string (replace <password>)
- [ ] Add Hostinger server IP to IP whitelist
  - Or temporarily use `0.0.0.0/0` for testing

### 3. Verify Domain Configuration

- [ ] edmarg.com points to Hostinger server
- [ ] DNS propagation complete (check: https://dnschecker.org)
- [ ] SSL certificate active on Hostinger

---

## 🚀 DEPLOYMENT STEPS (Follow This Order)

### Step 1: Read Documentation (5 minutes)

Open and read:
1. `HOSTINGER_DEPLOY_COMPLETE.md` - Full guide
2. `QUICK_DEPLOY_REFERENCE.md` - Quick commands

### Step 2: Connect to Server (2 minutes)

```bash
ssh u123456789@YOUR_SERVER_IP
pwd
ls -la
```

Expected: You should see your home directory

### Step 3: Clean Old Files (3 minutes)

```bash
# Clean frontend
cd ~/public_html
ls -la
rm -rf * .[!.]*
ls -la  # Should be empty

# Clean backend
cd ~
rm -rf backend
```

### Step 4: Build & Upload (10 minutes)

**On your local machine:**

```bash
cd /Users/bishtshivansugmail.com/Desktop/EdMarg

# Build frontend
cd frontend
npm run build
cd ..

# Create packages
tar -czf backend.tar.gz --exclude='node_modules' --exclude='.git' --exclude='.env' backend/

tar -czf frontend.tar.gz -C frontend --exclude='node_modules' .next/ public/ src/ package.json package-lock.json next.config.ts tsconfig.json

# Upload to server
scp backend.tar.gz u123456789@YOUR_SERVER_IP:~/
scp frontend.tar.gz u123456789@YOUR_SERVER_IP:~/
```

### Step 5: Extract on Server (2 minutes)

**Back on SSH:**

```bash
# Extract backend
cd ~
tar -xzf backend.tar.gz
rm backend.tar.gz

# Extract frontend
cd ~/public_html
tar -xzf ~/frontend.tar.gz
rm ~/frontend.tar.gz
```

### Step 6: Configure Backend (5 minutes)

```bash
cd ~/backend

# Create .env file
nano .env
```

**Paste this (REPLACE the values):**

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/edmarg?retryWrites=true&w=majority
JWT_SECRET=your-generated-32-char-secret-here
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=https://edmarg.com
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

**Install dependencies:**

```bash
npm install --production
```

### Step 7: Configure Frontend (5 minutes)

```bash
cd ~/public_html

# Create .env.production
nano .env.production
```

**Paste this (no changes needed):**

```env
NEXT_PUBLIC_API_URL=https://edmarg.com/api/v1
NEXT_PUBLIC_API_BASE_URL=https://edmarg.com
NEXT_PUBLIC_BACKEND_URL=https://edmarg.com
NEXT_PUBLIC_APP_NAME=EdMarg
NEXT_PUBLIC_APP_URL=https://edmarg.com
NEXT_PUBLIC_ENVIRONMENT=production
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

**Install and build:**

```bash
npm install --production
npm run build
```

### Step 8: Configure .htaccess (2 minutes)

```bash
cd ~/public_html
nano .htaccess
```

**Paste this:**

```apache
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Proxy API to backend
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]

# Proxy to Next.js
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

### Step 9: Configure Hostinger Node.js App (3 minutes)

1. Open browser → https://hpanel.hostinger.com
2. Login to your account
3. Go to: **Advanced** → **Node.js**
4. Click **Create Application**
5. Fill in:
   - **Application root**: `backend`
   - **Application startup file**: `server.js`
   - **Node.js version**: `20.x` or `22.x`
6. Click **Create**
7. Click **Restart**

### Step 10: Start Frontend (2 minutes)

**Back on SSH:**

```bash
# Install PM2 globally
npm install -g pm2

# Start frontend
cd ~/public_html
pm2 start npm --name "edmarg-frontend" -- start

# Save PM2 config
pm2 save

# Setup PM2 to start on reboot
pm2 startup
```

### Step 11: Seed Admin User (1 minute)

```bash
cd ~/backend
node scripts/seedAdmin.js
```

**Admin credentials created:**
- Email: `admin@edmarg.com`
- Password: `Admin@123`

### Step 12: Verify Deployment (5 minutes)

**Test on server:**

```bash
# Test backend
curl http://localhost:5000/api/status

# Test frontend
curl http://localhost:3000

# Test public domain
curl https://edmarg.com
curl https://edmarg.com/api/status
```

**Test in browser:**

1. Open https://edmarg.com
2. Open DevTools (F12) → Console tab
3. Check for errors (should be none)
4. Go to login page
5. Login with: admin@edmarg.com / Admin@123
6. Check Network tab - no CORS errors
7. Check Application → Cookies - auth token should be set

---

## ✅ SUCCESS CRITERIA

Your deployment is successful when:

- [ ] https://edmarg.com loads without errors
- [ ] https://edmarg.com/api/status returns `{"status":"success"}`
- [ ] Login works with admin credentials
- [ ] No CORS errors in browser console
- [ ] Cookies are set correctly
- [ ] All pages load properly

---

## 🔧 IF SOMETHING GOES WRONG

### CORS Errors in Browser

```bash
# Check CORS config
nano ~/backend/lib/withCors.js
# Verify 'https://edmarg.com' is in ALLOWED_ORIGINS

# Restart backend via Hostinger hPanel
```

### MongoDB Connection Failed

```bash
# Test connection
cd ~/backend
node -e "require('dotenv').config(); require('./lib/db')();"

# If fails:
# 1. Check MONGODB_URI in .env
# 2. Check MongoDB Atlas IP whitelist
# 3. Add Hostinger server IP
```

### Frontend Not Loading

```bash
# Check status
pm2 list

# Check logs
pm2 logs edmarg-frontend

# Restart
pm2 restart edmarg-frontend
```

### Backend Not Responding

```bash
# Check via Hostinger hPanel: Advanced → Node.js
# Click Restart

# Or check logs in hPanel
```

---

## 📞 NEED HELP?

1. Check `HOSTINGER_DEPLOY_COMPLETE.md` for detailed troubleshooting
2. Check `QUICK_DEPLOY_REFERENCE.md` for quick commands
3. Use `DEPLOYMENT_CHECKLIST_COMPLETE.md` to verify each step

---

## 🎉 AFTER SUCCESSFUL DEPLOYMENT

- [ ] Test all major features
- [ ] Create more users via admin panel
- [ ] Setup regular backups
- [ ] Monitor logs: `pm2 logs`
- [ ] Document any custom configurations

---

## 📝 NOTES SECTION

Write down your actual values here:

```
SSH Username: ___________________
Server IP: ___________________
MongoDB URI: ___________________
JWT Secret: ___________________
Deployment Date: ___________________
```

---

**Ready? Start with Step 1!** 🚀

Follow the steps in order, don't skip verification steps, and you'll have a successful deployment.

Good luck! 💪
