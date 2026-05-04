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
      .get();

    const messages = [];
    snapshot.forEach(doc => {
      messages.push({ _id: doc.id, ...doc.data() });
    });

    // Sort messages in memory to bypass Firestore composite index requirements
    messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch messages where user is either sender or receiver
    const sentSnapshot = await db.collection('messages')
      .where('senderId', '==', userId)
      .get();
    
    const receivedSnapshot = await db.collection('messages')
      .where('receiverId', '==', userId)
      .get();

    const conversationsMap = new Map();

    const processSnapshot = (snapshot) => {
      snapshot.forEach(doc => {
        const data = doc.data();
        const otherUserId = data.senderId === userId ? data.receiverId : data.senderId;
        
        if (!conversationsMap.has(otherUserId) || new Date(data.createdAt) > new Date(conversationsMap.get(otherUserId).createdAt)) {
          conversationsMap.set(otherUserId, {
            _id: doc.id,
            otherUserId,
            lastMessage: data.text,
            createdAt: data.createdAt,
            chatRoomId: data.chatRoomId
          });
        }
      });
    };

    processSnapshot(sentSnapshot);
    processSnapshot(receivedSnapshot);

    // Fetch user details for each conversation
    const conversations = await Promise.all(Array.from(conversationsMap.values()).map(async (conv) => {
      const userDoc = await db.collection('users').doc(conv.otherUserId).get();
      const userData = userDoc.exists ? userDoc.data() : { name: 'Unknown User' };
      return {
        ...conv,
        otherUserName: userData.name,
        otherUserProfileImage: userData.profileImage
      };
    }));

    // Sort by most recent
    conversations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete messages for a chat room
// @route   DELETE /api/messages/:receiverId
// @access  Private
export const deleteMessages = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.params;
    const chatRoomId = [senderId, receiverId].sort().join('_');

    const snapshot = await db.collection('messages')
      .where('chatRoomId', '==', chatRoomId)
      .get();

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    res.json({ message: 'Messages cleared' });
  } catch (error) {
    next(error);
  }
};
