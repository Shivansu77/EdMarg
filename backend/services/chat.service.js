const { Message } = require('../models/message.model');
const { User } = require('../models/user.model');
const mongoose = require('mongoose');

class ChatService {
  /**
   * Get chat history between two users, paginated
   */
  static async getMessagesBetweenUsers(user1Id, user2Id, limit = 50, skip = 0) {
    const messages = await Message.find({
      $or: [
        { sender: user1Id, receiver: user2Id },
        { sender: user2Id, receiver: user1Id },
      ],
    })
      .sort({ createdAt: 1 }) // Chronological order
      .skip(skip)
      .limit(limit);

    // Mark received messages as read
    await Message.updateMany(
      { sender: user2Id, receiver: user1Id, read: false },
      { $set: { read: true } }
    );

    return messages;
  }

  /**
   * Get a list of users the current user has chatted with
   */
  static async getContacts(userId) {
    const userIdObj = new mongoose.Types.ObjectId(userId);

    // Find all unique users the current user has exchanged messages with
    const contactsAggregation = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userIdObj }, { receiver: userIdObj }],
        },
      },
      {
        $sort: { createdAt: -1 }, // Sort by latest message first
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$sender', userIdObj] }, '$receiver', '$sender'],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', userIdObj] }, { $eq: ['$read', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails',
      },
      {
        $project: {
          _id: 1,
          name: '$userDetails.name',
          email: '$userDetails.email',
          profilePicture: '$userDetails.profilePicture',
          role: '$userDetails.role',
          lastMessage: 1,
          unreadCount: 1,
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    return contactsAggregation;
  }

  /**
   * Create a new message
   */
  static async createMessage(data) {
    const { sender, receiver, content, fileUrl, fileType, fileName } = data;

    const message = new Message({
      sender,
      receiver,
      content,
      fileUrl,
      fileType,
      fileName,
    });

    await message.save();
    return message;
  }
}

module.exports = ChatService;
