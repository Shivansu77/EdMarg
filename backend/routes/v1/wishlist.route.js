const express = require('express');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { toggleWishlist, getWishlist } = require('../../controllers/wishlist.controller');

const router = express.Router();

// All wishlist routes are for logged-in students only
router.use(protect);
router.use(authorize('student'));

router.get('/wishlist', getWishlist);
router.post('/wishlist/toggle/:mentorId', toggleWishlist);

module.exports = router;
