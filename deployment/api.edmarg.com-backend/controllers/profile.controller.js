const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises');
const { User } = require('../models/user.model');
const cloudinary = require('cloudinary').v2;

const cloudinaryUrl = (process.env.CLOUDINARY_URL || '').trim();
const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim().toLowerCase();
const cloudApiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
const cloudApiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

if (cloudinaryUrl) {
  cloudinary.config(cloudinaryUrl);
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: cloudApiKey,
    api_secret: cloudApiSecret
  });
}

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    // Process Image with Sharp
    const buffer = await sharp(req.file.buffer)
      .resize(400, 400, { fit: 'cover', position: 'center' })
      .toFormat('webp')
      .webp({ quality: 80 })
      .toBuffer();

    // Upload to Cloudinary
    const cloudinaryResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'edMarg/profiles', format: 'webp' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const imageUrl = cloudinaryResponse.secure_url;

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
    } else if (user.profileImage && user.profileImage.includes('cloudinary.com')) {
      // Optional: Delete old image from Cloudinary
      try {
        const publicId = user.profileImage.split('/').slice(-3).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.warn('Failed to delete old image from Cloudinary:', err.message);
      }
    }

    // Update User schema
    user.profileImage = imageUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      profileImage: imageUrl
    });

  } catch (error) {
    const cloudinaryMessage = (
      error?.error?.message ||
      error?.message ||
      ''
    ).toLowerCase();

    if (cloudinaryMessage.includes('unknown api key')) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary API key is invalid. Please verify CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend .env'
      });
    }

    if (cloudinaryMessage.includes('cloud_name') || cloudinaryMessage.includes('mismatch')) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary configuration mismatch. Please verify CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend .env'
      });
    }

    next(error);
  }
};
