// @ts-nocheck
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// ─── Image: memory storage (small files, streamed to Cloudinary) ────────────
const memoryStorage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const fs = require('fs');

// ─── Video: disk storage (large files, needed for FFmpeg compression) ───────
const VIDEO_TMP_DIR = path.join(__dirname, '..', 'uploads', 'tmp');
if (!fs.existsSync(VIDEO_TMP_DIR)) {
  fs.mkdirSync(VIDEO_TMP_DIR, { recursive: true });
}

const videoDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, VIDEO_TMP_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString('hex') + '_' + Date.now();
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `upload_${uniqueSuffix}${ext}`);
  },
});

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
  storage: memoryStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: imageFileFilter
});

const videoUpload = multer({
  storage: videoDiskStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: videoFileFilter
});

exports.uploadProfileImage = imageUpload.single('profileImage');
exports.uploadRecordingVideo = videoUpload.single('video');
