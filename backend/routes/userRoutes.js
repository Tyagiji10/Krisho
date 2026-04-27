import express from 'express';
import { authUser, registerUser, getUserProfile, googleLogin, updatePaymentDetails, updateUserProfile } from '../controllers/userController.js';
import { protect, supplier } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/google-login', googleLogin);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/payment', protect, supplier, updatePaymentDetails);

export default router;
