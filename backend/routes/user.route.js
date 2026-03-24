const express = require('express');
const { getUsers, createUser, loginUser, getMe, logoutUser, getBrowseMentors } = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin'), getUsers)
  .post(createUser);

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.get('/browsementor', getBrowseMentors);

module.exports = router;
