const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const {
  loginUser,
  getBrowseMentors,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  sendEmailVerificationOtp,
  verifyEmailVerificationOtp,
} = require('../controllers/user.controller');

const router = express.Router();

router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.post('/email/send-otp', protect, sendEmailVerificationOtp);
router.post('/email/verify-otp', protect, verifyEmailVerificationOtp);
router.get('/browsementor', getBrowseMentors);
router.post('/logout', protect, logoutUser);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
