import { db } from '../config/firebaseAdmin.js';

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user._id;

    if (!text || !receiverId) {
      res.status(400);
      throw new Error('Message text and receiver are required');
    }

    const chatRoomId = [senderId, receiverId].sort().join('_');

    const messageData = {
      chatRoomId,
      senderId,
      receiverId,
      text,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('messages').add(messageData);
    res.status(201).json({ _id: docRef.id, ...messageData });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a chat room
// @route   GET /api/messages/:receiverId
// @access  Private
export const getMessages = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.params;
    const chatRoomId = [senderId, receiverId].sort().join('_');

    const snapshot = await db.collection('messages')
      .where('chatRoomId', '==', chatRoomId)
      .orderBy('createdAt', 'asc')
      .get();

    const messages = [];
    snapshot.forEach(doc => {
      messages.push({ _id: doc.id, ...doc.data() });
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};
