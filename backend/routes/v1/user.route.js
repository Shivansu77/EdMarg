const express = require('express');
const { protect } = require('../../middlewares/auth.middleware');
const { signupUser, loginUser, getBrowseMentors, logoutUser, getCurrentUser } = require('../../controllers/user.controller');

const router = express.Router();

router.post('/', signupUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.get('/browsementor', getBrowseMentors);
router.post('/logout', protect, logoutUser);

module.exports = router;
