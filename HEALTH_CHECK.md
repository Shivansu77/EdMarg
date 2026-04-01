# Health Check Endpoints

## Backend Health Check

Add this to your backend if not already present:

**File:** `backend/routes/v1/index.js` or create new health route

```javascript
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

## Testing Health Checks

```bash
# Backend
curl https://your-backend-url.com/api/v1/health

# Expected Response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

## Monitoring

Set up monitoring in your deployment platform:
- Render: Automatic health checks
- Vercel: Built-in monitoring
- Railway: Health check configuration in settings
