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

const ALLOWED_VIDEO_MIMES = new Set([
  'video/mp4',
  'video/quicktime',       // .mov
  'video/x-matroska',      // .mkv
  'video/webm',
  'video/x-msvideo',       // .avi
]);

const videoFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/') || ALLOWED_VIDEO_MIMES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed! Accepted formats: .mp4, .mov, .mkv, .webm'), false);
  }
};

const imageUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: imageFileFilter
});

const videoUpload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: videoFileFilter
});

exports.uploadProfileImage = imageUpload.single('profileImage');
exports.uploadRecordingVideo = videoUpload.single('video');
