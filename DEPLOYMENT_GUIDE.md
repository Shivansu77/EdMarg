# EdMarg Deployment Guide

## Quick Deployment Options

### Option 1: Render (Recommended - Monorepo Support)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Add environment variables:
     - `MONGODB_URI`: Your MongoDB connection string (use MongoDB Atlas)
     - `JWT_SECRET`: Generate a secure random string

3. **MongoDB Setup**
   - Create free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Get connection string
   - Add to Render environment variables

### Option 2: Vercel (Frontend) + Render (Backend)

#### Backend on Render:
1. Create new Web Service
2. Connect repository
3. Set:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Root Directory: `backend`

#### Frontend on Vercel:
1. Import project at [vercel.com](https://vercel.com)
2. Set Root Directory: `frontend`
3. Add environment variables from `.env.production`
4. Deploy

### Option 3: Railway

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Add two services:
   - Backend: Root directory `backend`
   - Frontend: Root directory `frontend`
4. Add MongoDB plugin
5. Set environment variables

## Environment Variables Required

### Backend
```
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<generate-secure-random-string>
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=<your-frontend-url>
LOG_LEVEL=info
```

### Frontend
```
NEXT_PUBLIC_API_BASE_URL=<your-backend-url>/api/v1
NEXT_PUBLIC_BACKEND_URL=<your-backend-url>
NEXT_PUBLIC_APP_NAME=EdMarg
NEXT_PUBLIC_ENVIRONMENT=production
```

## Post-Deployment Steps

1. **Seed Admin User**
   ```bash
   # SSH into backend or use Render shell
   npm run seed:admin
   ```

2. **Seed Sample Assessments**
   ```bash
   npm run seed:assessments
   ```

3. **Test the Application**
   - Visit your frontend URL
   - Login with admin credentials
   - Create test data

## Troubleshooting

### CORS Issues
- Ensure `FRONTEND_ORIGIN` in backend matches your frontend URL exactly
- Check backend logs for CORS errors

### Database Connection
- Verify MongoDB URI is correct
- Whitelist all IPs (0.0.0.0/0) in MongoDB Atlas Network Access

### Build Failures
- Check Node.js version matches `engines` in package.json
- Verify all dependencies are in `dependencies` not `devDependencies`

## Health Checks

- Backend: `https://your-backend-url/api/v1/health`
- Frontend: `https://your-frontend-url`

## Monitoring

- Check logs in your platform dashboard
- Set up alerts for errors
- Monitor response times

## Scaling

- Render: Upgrade to paid plan for auto-scaling
- Vercel: Automatic scaling included
- Railway: Adjust resources in settings
