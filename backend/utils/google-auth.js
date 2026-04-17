const { OAuth2Client } = require('google-auth-library');

const getClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

  if (!clientId || !clientSecret || !callbackUrl) {
    throw new Error('Google OAuth environment variables are missing');
  }

  return new OAuth2Client(clientId, clientSecret, callbackUrl);
};

/**
 * Verify Google ID Token
 * @param {string} idToken 
 */
exports.verifyGoogleIdToken = async (idToken) => {
  const ticket = await getClient().verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
};

/**
 * Get Google Auth URL
 */
exports.getGoogleAuthUrl = () => {
  return getClient().generateAuthUrl({
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
exports.getTokensFromCode = async (code) => {
  const { tokens } = await getClient().getToken(code);
  return tokens;
};
