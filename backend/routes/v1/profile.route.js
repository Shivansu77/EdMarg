const express = require('express');
const { uploadProfileImage } = require('../../middlewares/upload.middleware');
const { uploadImage } = require('../../controllers/profile.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/upload-image', protect, uploadProfileImage, uploadImage);
router.put('/update-image', protect, uploadProfileImage, uploadImage);

module.exports = router;
