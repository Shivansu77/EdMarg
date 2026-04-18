const { OAuth2Client } = require('google-auth-library');

const path = require('path');

const getClient = (origin) => {
  // Try to load .env if any core variable is missing and we're not explicitly in production
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  let callbackUrl = process.env.GOOGLE_CALLBACK_URL;

  // If origin is provided, we can build a better callback URL
  // This is critical when running on edmarg.com but .env has localhost
  if (origin) {
    const isProd = process.env.NODE_ENV === 'production';
    const hasLocalCallback = callbackUrl && (callbackUrl.includes('localhost') || callbackUrl.includes('127.0.0.1'));
    
    if (!callbackUrl || (isProd && hasLocalCallback)) {
      callbackUrl = `${origin.replace(/\/$/, '')}/api/v1/users/auth/google/callback`;
      console.log(`[GoogleAuth] Using dynamic callbackUrl: ${callbackUrl}`);
    }
  }

  // Final fallback
  if (!callbackUrl) {
    const port = process.env.PORT || 5000;
    callbackUrl = `http://localhost:${port}/api/v1/users/auth/google/callback`;
  }

  if (!clientId || !clientSecret || !callbackUrl) {
    console.error('Missing Google Auth variables:', { clientId: !!clientId, clientSecret: !!clientSecret, callbackUrl });
    throw new Error('Google OAuth environment variables are missing');
  }

  return new OAuth2Client(clientId, clientSecret, callbackUrl);
};

/**
 * Verify Google ID Token
 * @param {string} idToken 
 */
exports.verifyGoogleIdToken = async (idToken, origin) => {
  const ticket = await getClient(origin).verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
};

/**
 * Get Google Auth URL
 */
exports.getGoogleAuthUrl = (origin) => {
  return getClient(origin).generateAuthUrl({
    access_type: 'offline',
    prompt: 'select_account',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });
};

/**
 * Get tokens from code
 * @param {string} code 
 */
exports.getTokensFromCode = async (code, origin) => {
  const { tokens } = await getClient(origin).getToken(code);
  return tokens;
};
