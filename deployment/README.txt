# EdMarg Hostinger Deployment Package

## 📦 Package Contents

- **edmarg-hostinger.zip** (1.6MB) - Ready to upload to Hostinger

## 🚀 Quick Deployment Steps

### 1. Deploy Backend (5 minutes)
- Go to https://render.com
- Create new Web Service
- Upload backend folder
- Add environment variables
- Copy backend URL

### 2. Upload to Hostinger (3 minutes)
- Login to https://hpanel.hostinger.com
- File Manager → public_html
- Upload edmarg-hostinger.zip
- Extract files
- Move to root directory

### 3. Enable SSL (1 minute)
- Hostinger Panel → SSL
- Enable free SSL certificate

## ⚙️ Backend Environment Variables

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/edmarg
JWT_SECRET=your-secret-key-minimum-32-characters
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

## 📝 Important Notes

1. **Backend Required**: Hostinger shared hosting doesn't support Node.js
   - Deploy backend on Render (free tier available)
   - Or use Hostinger VPS (paid)

2. **MongoDB**: Use MongoDB Atlas free tier
   - 512MB storage
   - Whitelist IP: 0.0.0.0/0

3. **Dynamic Routes**: Some dynamic routes removed for static export
   - Blog posts work fine
   - Main features functional

4. **SSL**: Always enable SSL for security

## 🔗 Useful Links

- **Render**: https://render.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Hostinger Panel**: https://hpanel.hostinger.com

## 💰 Cost Estimate

- Hostinger Shared: $2-10/month
- Render Free: $0 (sleeps after 15min)
- MongoDB Free: $0

**Total: $2-10/month**

## 📞 Support

Check DEPLOYMENT_INSTRUCTIONS.txt inside the zip file for detailed steps.

---

**Created**: $(date)
**Package Size**: 1.6MB
**Build**: Production Static Export
