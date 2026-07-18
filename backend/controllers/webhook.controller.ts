// @ts-nocheck
const { Webhook } = require('svix');
const userService = require('../services/user.service');

exports.handleClerkWebhook = async (req, res, next) => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.warn('CLERK_WEBHOOK_SECRET is not configured');
      return res.status(500).json({ success: false, message: 'Webhook secret is not configured' });
    }

    // Get the headers
    const svix_id = req.headers['svix-id'];
    const svix_timestamp = req.headers['svix-timestamp'];
    const svix_signature = req.headers['svix-signature'];

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ success: false, message: 'Missing svix headers' });
    }

    // Get the body as string/buffer, but we need it as a string for verify
    // Using express.raw() in the route ensures req.body is a Buffer
    const payload = req.body.toString('utf8');
    
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;

    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Error verifying webhook:', err.message);
      return res.status(400).json({ success: false, message: 'Webhook signature verification failed' });
    }

    const eventType = evt.type;
    const eventData = evt.data;
    
    console.log(`[Webhook] Processing event: ${eventType} for Clerk ID: ${eventData.id}`);

    if (eventType === 'user.created') {
      await userService.processWebhookUserCreated(eventData);
    } else if (eventType === 'user.updated') {
      await userService.processWebhookUserUpdated(eventData);
    } else if (eventType === 'user.deleted') {
      await userService.processWebhookUserDeleted(eventData);
    }

    return res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (err) {
    console.error('[Webhook Error]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
