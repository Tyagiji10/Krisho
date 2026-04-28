import express from 'express';
import { createRazorpayOrder, verifyPayment, razorpayWebhook } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/config', (req, res) => {
  res.send(process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder');
});

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);

export default router;
