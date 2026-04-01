# 🎯 Hostinger Deployment - Simple Steps

## ⚠️ IMPORTANT: Check First
Hostinger **Shared Hosting does NOT support Node.js**. You need:
- ✅ Hostinger VPS
- ✅ Hostinger Business/Premium with Node.js support

Contact Hostinger support to confirm your plan supports Node.js.

## 📋 What You Need
1. Hostinger VPS or Business plan
2. SSH access credentials
3. MongoDB Atlas account (free)
4. Your domain name

## 🚀 Deployment Steps

### 1. Setup MongoDB (5 minutes)
```
1. Go to mongodb.com/cloud/atlas
2. Sign up (free)
3. Create cluster
4. Create database user
5. Whitelist all IPs: 0.0.0.0/0
6. Copy connection string
```

### 2. Upload Files to Hostinger

**Option A: FTP (Easiest)**
```
1. Get FTP credentials from Hostinger hPanel
2. Use FileZilla
3. Upload entire EdMarg folder to public_html
4. Skip node_modules folders (we'll install on server)
```

**Option B: Git (Recommended)**
```bash
# On your computer
git init
git add .
git commit -m "Deploy"
git push to GitHub

# Then SSH to Hostinger
ssh your-username@your-server-ip
cd public_html
git clone your-github-repo-url
```

### 3. SSH into Hostinger
```bash
ssh your-username@your-server-ip
cd public_html/EdMarg
```

### 4. Run Deployment Script
```bash
chmod +x deploy-hostinger.sh
./deploy-hostinger.sh
```

The script will ask for:
- MongoDB connection string (paste from step 1)
- Your domain name

### 5. Configure Web Server

**In Hostinger hPanel:**
```
1. Go to Advanced → Application Setup
2. Select Node.js
3. Set Application Root: /public_html/EdMarg/frontend
4. Set Application URL: yourdomain.com
5. Set Application Startup File: server.js
```

### 6. Setup SSL
```
1. Go to hPanel → SSL
2. Install free SSL certificate
3. Force HTTPS
```

### 7. Test Your Website
```
Visit: https://yourdomain.com
API: https://yourdomain.com/api/v1/health
```

## 🔧 Manual Setup (if script fails)

### Backend:
```bash
cd backend
npm install --production

# Create .env file
nano .env
# Paste:
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-string
JWT_SECRET=generate-random-string
FRONTEND_ORIGIN=https://yourdomain.com

# Start
pm2 start server.js --name backend
```

### Frontend:
```bash
cd frontend
npm install
npm run build

# Create .env.production
nano .env.production
# Paste:
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com/api/v1
NEXT_PUBLIC_BACKEND_URL=https://yourdomain.com

# Start
pm2 start npm --name frontend -- start
```

### Save PM2:
```bash
pm2 save
pm2 startup
```

## 📊 Check Status
```bash
pm2 status
pm2 logs
```

## 🆘 Troubleshooting

**"Node.js not found"**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 22
```

**"Port already in use"**
```bash
pm2 delete all
pm2 start server.js --name backend
pm2 start npm --name frontend -- start
```

**"Cannot connect to MongoDB"**
- Check connection string
- Whitelist 0.0.0.0/0 in MongoDB Atlas
- Test: `ping cluster.mongodb.net`

**"502 Bad Gateway"**
```bash
pm2 restart all
sudo systemctl restart nginx
```

## 📞 Need Help?

1. Check Hostinger documentation
2. Contact Hostinger support (24/7 chat)
3. Check PM2 logs: `pm2 logs`

## 💰 Costs

- MongoDB Atlas: FREE
- Hostinger VPS: ~$4-8/month
- Domain: ~$10/year
- SSL: FREE

**Total: ~$5-10/month**
