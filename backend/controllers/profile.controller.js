const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs/promises');
const { User } = require('../models/user.model');

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    // Define directories
    const uploadDir = path.join(__dirname, '../uploads/profiles');
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique WEBP filename
    const filename = `${uuidv4()}.webp`;
    const filepath = path.join(uploadDir, filename);

    // Process Image with Sharp
    await sharp(req.file.buffer)
      .resize(400, 400, { fit: 'cover', position: 'center' })
      .toFormat('webp')
      .webp({ quality: 80 })
      .toFile(filepath);

    const relativePath = `/uploads/profiles/${filename}`;

    // Get current user and check for old image to delete
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.profileImage && user.profileImage.startsWith('/uploads')) {
      const oldImagePath = path.join(__dirname, '..', user.profileImage);
      try {
        await fs.unlink(oldImagePath);
      } catch (err) {
        console.warn('Failed to delete old image or already missing:', err.message);
      }
    }

    // Update User schema
    user.profileImage = relativePath;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      profileImage: relativePath
    });

  } catch (error) {
    next(error);
  }
};
