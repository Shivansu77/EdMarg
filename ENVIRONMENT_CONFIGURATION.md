# Environment Configuration Guide

## Overview
EdMarg uses environment-specific configuration files for different deployment stages.

## Backend Configuration

### Development (.env.local or .env)
```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/edmarg_db
JWT_SECRET=dev-secret-key
FRONTEND_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

### Staging (.env.staging)
```bash
PORT=5000
NODE_ENV=staging
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/edmarg_staging_db
JWT_SECRET=<strong-random-secret>
FRONTEND_ORIGIN=https://staging.edmarg.com
LOG_LEVEL=debug
```

### Production (.env.production)
```bash
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/edmarg_db
JWT_SECRET=<strong-random-secret>
FRONTEND_ORIGIN=https://edmarg.com
LOG_LEVEL=info
```

## Frontend Configuration

### Development (.env.development)
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=EdMarg Dev
NEXT_PUBLIC_ENVIRONMENT=development
```

### Staging (.env.staging)
```bash
NEXT_PUBLIC_API_BASE_URL=https://staging-api.edmarg.com
NEXT_PUBLIC_BACKEND_URL=https://staging-api.edmarg.com
NEXT_PUBLIC_APP_NAME=EdMarg Staging
NEXT_PUBLIC_ENVIRONMENT=staging
```

### Production (.env.production)
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.edmarg.com
NEXT_PUBLIC_BACKEND_URL=https://api.edmarg.com
NEXT_PUBLIC_APP_NAME=EdMarg
NEXT_PUBLIC_ENVIRONMENT=production
```

## Environment Variables Reference

### Backend

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment type | development, staging, production |
| MONGODB_URI | MongoDB connection string | mongodb://... |
| JWT_SECRET | JWT signing secret (min 32 chars) | random-string |
| JWT_EXPIRES_IN | Token expiration time | 7d |
| FRONTEND_ORIGIN | Frontend URL for CORS | https://edmarg.com |
| LOG_LEVEL | Logging level | debug, info, warn, error |
| DB_NAME | Database name | edmarg_db |

### Frontend

| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_API_BASE_URL | Backend API URL | https://api.edmarg.com |
| NEXT_PUBLIC_BACKEND_URL | Backend URL | https://api.edmarg.com |
| NEXT_PUBLIC_APP_NAME | Application name | EdMarg |
| NEXT_PUBLIC_APP_URL | Frontend URL | https://edmarg.com |
| NEXT_PUBLIC_ENVIRONMENT | Environment type | production |

## Setup Instructions

### Backend
1. Copy `.env.example` to `.env.local` for development
2. Update values with your local setup
3. For production, create `.env.production` with production values
4. Never commit `.env` files with sensitive data

### Frontend
1. Copy `.env.example` to `.env.local` for development
2. Update `NEXT_PUBLIC_API_BASE_URL` to match your backend
3. For production, create `.env.production` with production values
4. Frontend env vars must be prefixed with `NEXT_PUBLIC_` to be accessible in browser

## Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use strong JWT secrets** - Generate with: `openssl rand -base64 32`
3. **Rotate secrets regularly** - Especially in production
4. **Use environment-specific databases** - Don't share prod/staging/dev databases
5. **Restrict CORS origins** - Only allow your frontend domain
6. **Use HTTPS in production** - All API calls should be over HTTPS
7. **Store secrets in CI/CD** - Use GitHub Secrets, GitLab CI/CD, etc.

## Deployment

### Vercel (Frontend)
1. Go to Project Settings → Environment Variables
2. Add variables for each environment (Production, Preview, Development)
3. Prefix with `NEXT_PUBLIC_` for browser access

### Heroku/Railway (Backend)
1. Set environment variables in dashboard or CLI
2. Use `heroku config:set KEY=VALUE`
3. Ensure `NODE_ENV=production` is set

### Docker
```dockerfile
ENV NODE_ENV=production
ENV MONGODB_URI=${MONGODB_URI}
ENV JWT_SECRET=${JWT_SECRET}
```

## Troubleshooting

### API calls failing
- Check `NEXT_PUBLIC_API_BASE_URL` matches backend URL
- Verify CORS `FRONTEND_ORIGIN` matches frontend URL
- Check network tab for actual request URL

### JWT errors
- Ensure `JWT_SECRET` is the same across all instances
- Check token expiration with `JWT_EXPIRES_IN`
- Verify token is being sent in Authorization header

### Database connection issues
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist
- Ensure database user has correct permissions
