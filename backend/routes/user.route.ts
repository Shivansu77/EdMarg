// @ts-nocheck
const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const {
  getBrowseMentors,
  getCurrentUser,
  updateUserProfile,
} = require('../controllers/user.controller');

const router = express.Router();

router.get('/me', protect, getCurrentUser);
router.get('/browsementor', getBrowseMentors);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
