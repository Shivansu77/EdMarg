// @ts-nocheck
const express = require('express');
const { protect } = require('../../middlewares/auth.middleware');
const { cacheResponse } = require('../../middlewares/cache.middleware');
const { getBrowseMentors, getCurrentUser } = require('../../controllers/user.controller');

const router = express.Router();

router.get('/me', protect, cacheResponse({ ttlSeconds: 30 }), getCurrentUser);
router.get('/mentors', cacheResponse({ ttlSeconds: 120 }), getBrowseMentors); // Renamed from /browsementor

module.exports = router;
