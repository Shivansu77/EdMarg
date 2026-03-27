const express = require('express');
const { protect } = require('../../middlewares/auth.middleware');
const { loginUser, getBrowseMentors, logoutUser, getCurrentUser } = require('../../controllers/user.controller');

const router = express.Router();

// V2 endpoints can have enhanced features, pagination, filtering, etc.
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.get('/mentors', getBrowseMentors); // Renamed from /browsementor
router.post('/logout', protect, logoutUser);

module.exports = router;
