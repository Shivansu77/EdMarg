const express = require('express');
const { protect } = require('../../middlewares/auth.middleware');
const { loginUser, getBrowseMentors, logoutUser } = require('../../controllers/user.controller');

const router = express.Router();

router.post('/login', loginUser);
router.get('/browsementor', protect, getBrowseMentors);
router.post('/logout', protect, logoutUser);

module.exports = router;
