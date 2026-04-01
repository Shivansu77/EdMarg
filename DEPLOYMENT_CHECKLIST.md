# 🚀 Quick Deployment Checklist

## Before You Deploy

- [ ] Push code to GitHub repository
- [ ] Create MongoDB Atlas account (free tier)
- [ ] Get MongoDB connection string
- [ ] Generate JWT secret (use: `openssl rand -base64 32`)

## Deployment Steps (Render - Easiest)

### 1. MongoDB Setup (5 minutes)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist all IPs: `0.0.0.0/0`
5. Copy connection string

### 2. Deploy on Render (10 minutes)
1. Go to [render.com](https://render.com) and sign up
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml` automatically
5. Add environment variables:
   - `MONGODB_URI`: Paste your MongoDB connection string
   - `JWT_SECRET`: Paste generated secret
6. Click **"Apply"**
7. Wait for deployment (5-10 minutes)

### 3. Update Frontend URLs
After backend deploys, update frontend environment variables:
- `NEXT_PUBLIC_API_BASE_URL`: `https://edmarg-backend.onrender.com/api/v1`
- `NEXT_PUBLIC_BACKEND_URL`: `https://edmarg-backend.onrender.com`

### 4. Seed Initial Data
In Render backend shell:
```bash
npm run seed:admin
npm run seed:assessments
```

### 5. Test Your App
- Visit your frontend URL
- Login with admin credentials (check console output from seed script)
- Create a test student account

## Alternative: File Upload Deployment

If you're uploading files directly (not using Git):

### For Vercel (Frontend):
1. Zip the `frontend` folder
2. Go to [vercel.com](https://vercel.com)
3. Drag and drop the zip file
4. Set environment variables
5. Deploy

### For Render (Backend):
1. Create new Web Service
2. Choose "Deploy from Git" or use Docker
3. Upload your code via Git or Docker Hub

## Environment Variables Reference

### Backend (Required)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edmarg_db
JWT_SECRET=your-generated-secret-here
FRONTEND_ORIGIN=https://your-frontend-url.com
```

### Frontend (Required)
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com/api/v1
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

## Troubleshooting

### Backend won't start
- Check MongoDB connection string is correct
- Verify JWT_SECRET is set
- Check logs in Render dashboard

### Frontend can't connect to backend
- Verify NEXT_PUBLIC_API_BASE_URL is correct
- Check CORS settings (FRONTEND_ORIGIN in backend)
- Check backend is running

### Database connection failed
- Whitelist all IPs in MongoDB Atlas
- Check connection string format
- Verify database user credentials

## Need Help?

- Render Docs: [render.com/docs](https://render.com/docs)
- MongoDB Atlas: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)

## Estimated Costs

- MongoDB Atlas: **FREE** (512MB)
- Render: **FREE** (750 hours/month, sleeps after inactivity)
- Vercel: **FREE** (Hobby plan)

**Total: $0/month** for development/testing
