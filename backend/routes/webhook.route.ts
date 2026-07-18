// @ts-nocheck
const express = require('express');
const { handleClerkWebhook } = require('../controllers/webhook.controller');

const router = express.Router();

// Clerk webhooks require the raw body for signature verification
router.post('/clerk', express.raw({ type: 'application/json' }), handleClerkWebhook);

module.exports = router;
