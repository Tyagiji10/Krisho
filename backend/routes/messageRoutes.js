import express from 'express';
import { sendMessage, getMessages, getConversations, deleteMessages } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.post('/', protect, sendMessage);
router.get('/:receiverId', protect, getMessages);
router.delete('/:receiverId', protect, deleteMessages);

export default router;
