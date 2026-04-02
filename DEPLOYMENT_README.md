# 🚀 EDMARG HOSTINGER DEPLOYMENT

## ✅ Environment Files Fixed & Verified

All URLs have been updated to use **edmarg.com** (no more vercel.app or onrender.com errors).

---

## 📚 Deployment Guides

### 🎯 Quick Deployment (Recommended)
**[DEPLOY_NOW.md](./DEPLOY_NOW.md)** - Simple 13-step guide with just the commands you need

### 📖 Detailed Deployment
**[HOSTINGER_SINGLE_SERVER_DEPLOY.md](./HOSTINGER_SINGLE_SERVER_DEPLOY.md)** - Complete guide with explanations and troubleshooting

---

## 🔍 Before You Deploy

### 1. Verify Environment Files
```bash
./check-env-urls.sh
```
Expected: ✅ All environment files are correctly configured!

### 2. Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Save this secret - you'll need it during deployment.

---

## 🎯 Deployment Architecture

**Single Hostinger Server:**
- **Backend**: Node.js app (port 5000) - Managed by Hostinger Node.js panel
- **Frontend**: Next.js app (port 3000) - Managed by PM2
- **Proxy**: Apache .htaccess routes traffic
  - `/api/*` → Backend (port 5000)
  - `/*` → Frontend (port 3000)
- **Domain**: https://edmarg.com
- **Database**: MongoDB Atlas

---

## 📋 Quick Start

1. **Read**: [DEPLOY_NOW.md](./DEPLOY_NOW.md)
2. **Gather**: SSH credentials, MongoDB URI, JWT secret
3. **Deploy**: Follow the 13 steps
4. **Verify**: Test at https://edmarg.com

---

## ✅ What Was Fixed

- ✅ `backend/.env` - Changed FRONTEND_ORIGIN to https://edmarg.com
- ✅ `backend/.env.production` - Already correct
- ✅ `frontend/.env.production` - Already correct
- ✅ `backend/lib/withCors.js` - Includes https://edmarg.com
- ✅ `backend/server.js` - Includes https://edmarg.com

**Verification**: All files checked and verified with `check-env-urls.sh`

---

## 🔧 Configuration Summary

### Backend Environment
```env
PORT=5000
NODE_ENV=production
FRONTEND_ORIGIN=https://edmarg.com
MONGODB_URI=mongodb+srv://edMarg:kickBash11@cluster0...
JWT_SECRET=[Your generated secret]
```

### Frontend Environment
```env
NEXT_PUBLIC_API_URL=https://edmarg.com/api/v1
NEXT_PUBLIC_BACKEND_URL=https://edmarg.com
NEXT_PUBLIC_APP_URL=https://edmarg.com
```

### CORS Configuration
```javascript
ALLOWED_ORIGINS = ['https://edmarg.com', 'http://localhost:3000']
```

---

## 🎉 Success Criteria

After deployment, verify:
- ✅ https://edmarg.com loads
- ✅ https://edmarg.com/api/status returns success
- ✅ Login works (admin@edmarg.com / Admin@123)
- ✅ No CORS errors in browser console
- ✅ Cookies stored correctly

---

## 🔧 Quick Troubleshooting

**CORS Error?**
→ Restart backend via Hostinger hPanel

**Frontend Not Loading?**
→ `pm2 restart edmarg-frontend`

**Backend Not Responding?**
→ Check Hostinger hPanel → Node.js → Restart

**MongoDB Connection Failed?**
→ Add Hostinger IP to MongoDB Atlas whitelist

---

## 📞 Important URLs

- **Production**: https://edmarg.com
- **API Status**: https://edmarg.com/api/status
- **Hostinger hPanel**: https://hpanel.hostinger.com
- **MongoDB Atlas**: https://cloud.mongodb.com

---

## 📝 Admin Credentials (After Seeding)

- **Email**: admin@edmarg.com
- **Password**: Admin@123

---

## 🚀 Ready to Deploy!

**Start here**: [DEPLOY_NOW.md](./DEPLOY_NOW.md)

All environment files are fixed and verified. No more URL errors will occur.

Good luck! 🎉
