const ChatService = require('../services/chat.service');

/**
 * Handle socket events for real-time chat
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
function handleChatEvents(io, socket) {
  const userId = socket.userId;

  // Listen for a new message
  socket.on('send_message', async (data, callback) => {
    try {
      const { receiverId, content, fileUrl, fileType, fileName } = data;

      if (!receiverId || (!content && !fileUrl)) {
        if (callback) callback({ error: 'Invalid message data' });
        return;
      }

      // Save to database
      const message = await ChatService.createMessage({
        sender: userId,
        receiver: receiverId,
        content,
        fileUrl,
        fileType,
        fileName,
      });

      // Emit to receiver
      io.to(`user:${receiverId}`).emit('receive_message', message);

      // Emit to sender (in case they have multiple tabs open)
      // io.to(`user:${userId}`).emit('receive_message', message); // Optional, we can return via callback instead
      
      // Acknowledge sender
      if (callback) callback({ success: true, message });

    } catch (error) {
      console.error('[Socket.io] Chat Error:', error);
      if (callback) callback({ error: 'Failed to send message' });
    }
  });

  // Listen for typing events
  socket.on('typing', (data) => {
    const { receiverId } = data;
    io.to(`user:${receiverId}`).emit('typing', { senderId: userId });
  });

  socket.on('stop_typing', (data) => {
    const { receiverId } = data;
    io.to(`user:${receiverId}`).emit('stop_typing', { senderId: userId });
  });

  // Listen for read receipts
  socket.on('mark_read', async (data) => {
    try {
      const { senderId } = data; // The user who originally sent the message
      const { Message } = require('../models/message.model');
      
      // Update DB
      await Message.updateMany(
        { sender: senderId, receiver: userId, read: false },
        { $set: { read: true } }
      );

      // Notify the sender that their messages were read
      io.to(`user:${senderId}`).emit('messages_read', { receiverId: userId });
    } catch (error) {
      console.error('[Socket.io] Error marking read:', error);
    }
  });
}

module.exports = { handleChatEvents };
