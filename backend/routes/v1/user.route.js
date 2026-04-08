const express = require('express');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const {
  signupUser,
  loginUser,
  getBrowseMentors,
  getMentorById,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  submitAssessment,
} = require('../../controllers/user.controller');

const router = express.Router();

router.post('/', signupUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.get('/browsementor', getBrowseMentors);
router.get('/mentor/:id', getMentorById);
router.post('/logout', logoutUser);
router.put('/profile', protect, updateUserProfile);
router.post('/assessment', protect, authorize('student'), submitAssessment);

module.exports = router;
