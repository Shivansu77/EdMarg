const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/message.controller');
const { protect } = require('../../middlewares/auth.middleware');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types: images, pdf, doc, docx, txt
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and text documents are allowed.'));
    }
  },
});

// All routes require authentication
router.use(protect);

router.get('/contacts', messageController.getContacts);
router.get('/:contactId', messageController.getMessages);
router.post('/upload', upload.single('file'), messageController.uploadAttachment);

module.exports = router;
