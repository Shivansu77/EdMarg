const express = require('express');
const { protect } = require('../../middlewares/auth.middleware');
const { cacheResponse } = require('../../middlewares/cache.middleware');
const { loginUser, getBrowseMentors, logoutUser, getCurrentUser } = require('../../controllers/user.controller');

const router = express.Router();

// V2 endpoints can have enhanced features, pagination, filtering, etc.
router.post('/login', loginUser);
router.get('/me', protect, cacheResponse({ ttlSeconds: 30 }), getCurrentUser);
router.get('/mentors', cacheResponse({ ttlSeconds: 120 }), getBrowseMentors); // Renamed from /browsementor
router.post('/logout', protect, logoutUser);

module.exports = router;
