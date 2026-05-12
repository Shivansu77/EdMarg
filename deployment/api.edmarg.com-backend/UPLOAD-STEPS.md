# Upload Steps For `api.edmarg.com`

This zip is prepared for Node.js hosting such as cPanel Node.js App, Hostinger Node hosting, a VPS, or any panel that lets you upload files and run `npm install`.

If your hosting plan does not support Node.js apps, this backend cannot run by simple file upload alone.

## 1. Create the subdomain

Create `api.edmarg.com` in your hosting panel and point it to this backend app.

## 2. Upload and extract

Upload the zip file, then extract it into the app directory for `api.edmarg.com`.

## 3. Create the env file

1. Duplicate `.env.example` as `.env`
2. Fill in your real values:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `FRONTEND_ORIGIN`
   - `FRONTEND_ORIGINS`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_CALLBACK_URL`
   - `SMTP_*`
   - `CLOUDINARY_*`
   - `ZOOM_*`

Use this Google callback URL:

`https://api.edmarg.com/api/v1/users/auth/google/callback`

## 4. Install packages

Run:

```bash
npm install --omit=dev
```

## 5. Start the app

Use one of these depending on your host:

```bash
npm start
```

Or if the host asks for a startup file:

`app.js`

## 6. Restart and test

Open:

- `https://api.edmarg.com/health`
- `https://api.edmarg.com/api/v1/health`

You should get a healthy JSON response.

## 7. Update the frontend after backend is live

Point your frontend env vars to the new API host:

```env
NEXT_PUBLIC_BACKEND_URL=https://api.edmarg.com
NEXT_PUBLIC_API_URL=https://api.edmarg.com/api/v1
NEXT_PUBLIC_API_BASE_URL=https://api.edmarg.com/api/v1
```

## 8. Important notes

- This bundle does not include your local `.env` secrets.
- `node_modules` is intentionally not included. Install packages on the server itself, especially because `sharp` must match the server OS.
- The broken local dependency (`file:..`) was removed from this deployment copy so `npm install` can run on the server.
- If Google login is enabled, add the callback URL above in Google Cloud Console.
