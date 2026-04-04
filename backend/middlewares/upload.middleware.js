const multer = require('multer');

// Store file in memory to process with Sharp
const storage = multer.memoryStorage();

// File filter (accept only images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Multer upload instance: 2MB limit
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter
});

exports.uploadProfileImage = upload.single('profileImage');
