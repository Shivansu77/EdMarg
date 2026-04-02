# 🚀 SIMPLE HOSTINGER DEPLOYMENT

## ✅ Pre-Deployment Check

Run this first to verify all URLs are correct:
```bash
./check-env-urls.sh
```

Expected: ✅ All environment files are correctly configured!

---

## 📝 What You Need

1. **SSH Access**: `ssh u123456789@YOUR_SERVER_IP`
2. **MongoDB URI**: Already in backend/.env
3. **JWT Secret**: Generate with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

---

## 🎯 Deployment (13 Steps)

### 1. Connect to Server
```bash
ssh u123456789@YOUR_SERVER_IP
```

### 2. Clean Old Files
```bash
cd ~/public_html && rm -rf * .[!.]* && cd ~
rm -rf backend
```

### 3. Build Frontend (Local Machine)
```bash
cd /Users/bishtshivansugmail.com/Desktop/EdMarg/frontend
npm run build
```

### 4. Create Packages (Local Machine)
```bash
cd /Users/bishtshivansugmail.com/Desktop/EdMarg

tar -czf backend.tar.gz --exclude='node_modules' --exclude='.git' backend/
tar -czf frontend.tar.gz -C frontend --exclude='node_modules' .next/ public/ src/ package*.json *.ts
```

### 5. Upload (Local Machine)
```bash
scp backend.tar.gz frontend.tar.gz u123456789@YOUR_SERVER_IP:~/
```

### 6. Extract (Server)
```bash
cd ~ && tar -xzf backend.tar.gz && rm backend.tar.gz
cd ~/public_html && tar -xzf ~/frontend.tar.gz && rm ~/frontend.tar.gz
```

### 7. Configure Backend (Server)
```bash
cd ~/backend
cp .env.production .env
nano .env
# Update JWT_SECRET with your generated secret
# Save: Ctrl+O, Enter, Ctrl+X

npm install --production
```

### 8. Configure Frontend (Server)
```bash
cd ~/public_html
cp .env.production .env.production
npm install --production
npm run build
```

### 9. Create .htaccess (Server)
```bash
cd ~/public_html
cat > .htaccess << 'EOF'
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
EOF
```

### 10. Setup Backend (Hostinger hPanel)
1. Go to https://hpanel.hostinger.com
2. Advanced → Node.js → Create Application
3. Root: `backend`, Startup: `server.js`, Node: `20.x`
4. Create → Restart

### 11. Start Frontend (Server)
```bash
npm install -g pm2
cd ~/public_html
pm2 start npm --name "edmarg-frontend" -- start
pm2 save
pm2 startup
```

### 12. Seed Admin (Server)
```bash
cd ~/backend
node scripts/seedAdmin.js
```

### 13. Verify
```bash
curl https://edmarg.com
curl https://edmarg.com/api/status
```

---

## ✅ Test in Browser

1. Open https://edmarg.com
2. Login: `admin@edmarg.com` / `Admin@123`
3. Check DevTools → No CORS errors
4. Check Application → Cookies → Auth token set

---

## 🔧 Quick Fixes

**CORS Error?**
```bash
# Restart backend via Hostinger hPanel
```

**Frontend Not Loading?**
```bash
pm2 restart edmarg-frontend
pm2 logs edmarg-frontend
```

**MongoDB Error?**
```bash
cd ~/backend
node -e "require('dotenv').config(); require('./lib/db')();"
# Add Hostinger IP to MongoDB Atlas whitelist
```

---

## 🎉 Done!

Your app is live at: **https://edmarg.com**

---

## 📚 Full Documentation

For detailed guide, see: **HOSTINGER_SINGLE_SERVER_DEPLOY.md**
