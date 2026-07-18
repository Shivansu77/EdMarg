// @ts-nocheck
const crypto = require('crypto');
const http = require('http');
require('dotenv').config({ path: '../.env' });

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  console.error('CLERK_WEBHOOK_SECRET is not set in backend/.env');
  process.exit(1);
}

// Ensure the secret is base64 decoded for signing, svix secrets start with "whsec_"
const secretKey = WEBHOOK_SECRET.startsWith('whsec_') 
  ? Buffer.from(WEBHOOK_SECRET.split('whsec_')[1], 'base64') 
  : Buffer.from(WEBHOOK_SECRET, 'base64'); // Fallback

// Sample Clerk payload for user.created
const payload = {
  data: {
    birthday: '',
    created_at: 1654012591514,
    email_addresses: [
      {
        email_address: 'test.user@example.com',
        id: 'idn_29w83yL7CwVlJXylYLxcslromF1',
        linked_to: [],
        object: 'email_address',
        verification: {
          status: 'verified',
          strategy: 'ticket'
        }
      }
    ],
    external_accounts: [],
    external_id: '567772',
    first_name: 'Test',
    gender: '',
    id: 'user_29w83sxmDNGwOuEthce5gg56FcC',
    image_url: 'https://img.clerk.com/xxxxxx',
    last_name: 'User',
    last_sign_in_at: 1654012591514,
    object: 'user',
    password_enabled: true,
    phone_numbers: [],
    primary_email_address_id: 'idn_29w83yL7CwVlJXylYLxcslromF1',
    primary_phone_number_id: null,
    primary_web3_wallet_id: null,
    private_metadata: {},
    profile_image_url: 'https://www.gravatar.com/avatar?d=mp',
    public_metadata: {},
    two_factor_enabled: false,
    unsafe_metadata: {},
    updated_at: 1654012591835,
    username: null,
    web3_wallets: []
  },
  object: 'event',
  type: 'user.created'
};

const payloadString = JSON.stringify(payload);

// Generate Svix Headers
const msgId = `msg_${crypto.randomBytes(16).toString('hex')}`;
const timestamp = Math.floor(Date.now() / 1000).toString();
const toSign = `${msgId}.${timestamp}.${payloadString}`;

const signature = crypto
  .createHmac('sha256', secretKey)
  .update(toSign)
  .digest('base64');

const svixSignature = `v1,${signature}`;

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 5000,
  path: '/api/webhooks/clerk',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'svix-id': msgId,
    'svix-timestamp': timestamp,
    'svix-signature': svixSignature,
  }
};

console.log('Sending webhook simulation...');

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response: ${data}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
  console.log('Make sure the backend server is running on localhost:5000');
});

req.write(payloadString);
req.end();
