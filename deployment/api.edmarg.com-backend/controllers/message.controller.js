const ChatService = require('../services/chat.service');
const { uploadDocumentBuffer } = require('../services/cloudinary.service');
const path = require('path');

const getContacts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const contacts = await ChatService.getContacts(userId);
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { contactId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const messages = await ChatService.getMessagesBetweenUsers(
      userId,
      contactId,
      parseInt(limit),
      parseInt(skip)
    );

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;

    // Upload to Cloudinary
    const result = await uploadDocumentBuffer(fileBuffer, {
      folder: 'chat-attachments',
      publicId: `msg_${Date.now()}_${path.parse(originalName).name.substring(0, 20)}`,
    });

    res.status(200).json({
      success: true,
      data: {
        fileUrl: result.secure_url,
        fileType: mimeType,
        fileName: originalName,
        resourceType: result.resource_type,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContacts,
  getMessages,
  uploadAttachment,
};
