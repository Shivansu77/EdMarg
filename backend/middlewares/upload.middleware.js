const multer = require('multer');

// Store files in memory so they can be streamed to Cloudinary.
const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const videoFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'), false);
  }
};

const imageUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: imageFileFilter
});

const videoUpload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 }, // 250 MB
  fileFilter: videoFileFilter
});

exports.uploadProfileImage = imageUpload.single('profileImage');
exports.uploadRecordingVideo = videoUpload.single('video');
