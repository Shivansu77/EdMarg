# Deploy EdMarg on Hostinger

## Prerequisites
- Hostinger VPS or Business/Premium hosting plan (shared hosting won't work for Node.js)
- SSH access to your server
- Domain name (optional)

## Step 1: Prepare Your Files

### Files to Upload:
```
EdMarg/
├── backend/          (entire folder)
├── frontend/         (entire folder - we'll build it)
└── .env files        (create these on server)
```

## Step 2: Upload to Hostinger

### Option A: Using File Manager
1. Login to Hostinger hPanel
2. Go to **File Manager**
3. Navigate to `public_html` or create new folder `edmarg`
4. Upload entire `backend` and `frontend` folders
5. This may take time due to `node_modules` - see Option B

### Option B: Using FTP (Recommended)
1. Get FTP credentials from Hostinger hPanel
2. Use FileZilla or any FTP client
3. Upload folders (exclude `node_modules` and `.next`)
4. We'll install dependencies on server

### Option C: Using Git (Best)
```bash
# On your local machine
git init
git add .
git commit -m "Initial commit"
git push to GitHub

# Then SSH into Hostinger and clone
ssh username@your-server-ip
cd public_html
git clone https://github.com/yourusername/edmarg.git
```

## Step 3: SSH into Hostinger Server

```bash
ssh username@your-server-ip
cd public_html/edmarg  # or wherever you uploaded
```

## Step 4: Install Node.js (if not installed)

```bash
# Check if Node.js is installed
node --version

# If not installed, install via NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
```

## Step 5: Setup MongoDB

### Option A: MongoDB Atlas (Recommended - Free)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Use this in your `.env` file

### Option B: Install MongoDB on Hostinger VPS
```bash
# Only if you have VPS
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
```

## Step 6: Configure Backend

```bash
cd backend

# Create production environment file
cat > .env << EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
EOF

# Install dependencies
npm install --production

# Seed initial data
npm run seed:admin
npm run seed:assessments
```

## Step 7: Configure Frontend

```bash
cd ../frontend

# Create production environment file
cat > .env.production << EOF
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com/api/v1
NEXT_PUBLIC_BACKEND_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME=EdMarg
NEXT_PUBLIC_ENVIRONMENT=production
EOF

# Install dependencies
npm install

# Build for production
npm run build
```

## Step 8: Setup PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd ~/public_html/edmarg/backend
pm2 start server.js --name edmarg-backend

# Start frontend
cd ~/public_html/edmarg/frontend
pm2 start npm --name edmarg-frontend -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on server reboot
pm2 startup
```

## Step 9: Configure Nginx/Apache

### For Nginx (if using VPS):

Create `/etc/nginx/sites-available/edmarg`:

```nginx
# Backend
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/edmarg /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### For Apache (Hostinger Shared Hosting):

Create `.htaccess` in `public_html`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]
    RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
</IfModule>
```

## Step 10: Setup SSL (HTTPS)

### Using Hostinger's Free SSL:
1. Go to hPanel
2. Navigate to **SSL**
3. Install free SSL certificate
4. Force HTTPS

### Or use Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Step 11: Configure Firewall

```bash
# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## Verify Deployment

```bash
# Check if services are running
pm2 status

# Check logs
pm2 logs edmarg-backend
pm2 logs edmarg-frontend

# Test backend
curl http://localhost:5000/api/v1/health

# Test frontend
curl http://localhost:3000
```

## Access Your Website

- Frontend: `https://yourdomain.com`
- Backend API: `https://yourdomain.com/api/v1` or `https://api.yourdomain.com`

## Useful PM2 Commands

```bash
pm2 list              # List all processes
pm2 restart all       # Restart all services
pm2 stop all          # Stop all services
pm2 logs              # View logs
pm2 monit             # Monitor resources
```

## Troubleshooting

### Port already in use:
```bash
# Find process using port
lsof -i :5000
# Kill process
kill -9 <PID>
```

### Permission denied:
```bash
sudo chown -R $USER:$USER ~/public_html/edmarg
chmod -R 755 ~/public_html/edmarg
```

### MongoDB connection failed:
- Check MongoDB Atlas whitelist (add 0.0.0.0/0)
- Verify connection string in `.env`

### Services not starting:
```bash
pm2 delete all
pm2 start server.js --name edmarg-backend
pm2 start npm --name edmarg-frontend -- start
```

## Update/Redeploy

```bash
cd ~/public_html/edmarg

# Pull latest changes (if using Git)
git pull

# Update backend
cd backend
npm install
pm2 restart edmarg-backend

# Update frontend
cd ../frontend
npm install
npm run build
pm2 restart edmarg-frontend
```

## Important Notes

1. **Hostinger Shared Hosting Limitations:**
   - May not support Node.js applications
   - Need VPS or Business plan for Node.js
   - Check with Hostinger support first

2. **Resource Usage:**
   - Monitor CPU/RAM usage
   - Upgrade plan if needed

3. **Backups:**
   - Setup automatic backups in hPanel
   - Backup MongoDB regularly

4. **Security:**
   - Keep Node.js and packages updated
   - Use strong JWT_SECRET
   - Enable firewall
   - Regular security audits
