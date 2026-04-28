import Razorpay from 'razorpay';
import crypto from 'crypto';
import { db } from '../config/firebaseAdmin.js';

// Initialize Razorpay (using test fallback keys if not in env)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, splits } = req.body; // splits: [{ supplierId, amount }]
    if (!amount) { res.status(400); throw new Error('Amount is required'); }

    const options = {
      amount: amount * 100, // razorpay expects paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    // If splits are provided, configure Route transfers
    if (splits && splits.length > 0) {
      const transfers = [];
      for (const split of splits) {
        // Fetch supplier razorpay account id from DB
        const supplierDoc = await db.collection('users').doc(split.supplierId).get();
        if (supplierDoc.exists) {
          const supplierData = supplierDoc.data();
          const rzpAccId = supplierData.paymentDetails?.razorpay_account_id;
          
          if (rzpAccId) {
            transfers.push({
              account: rzpAccId,
              amount: Math.floor(split.amount * 100 * 0.95), // 5% platform fee deduction
              currency: 'INR',
              notes: {
                supplier_id: split.supplierId,
              },
              on_hold: false,
            });
          }
        }
      }
      if (transfers.length > 0) {
        options.transfers = transfers;
      }
    }

    // If using mock placeholders, bypass external API
    if (
      !process.env.RAZORPAY_KEY_ID || 
      process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder' || 
      process.env.RAZORPAY_KEY_ID === 'your_razorpay_key_id'
    ) {
      return res.status(201).json({
        id: `order_mock_${Date.now()}`,
        amount: options.amount,
        currency: 'INR',
        mock: true,
        transfers_configured: options.transfers ? true : false
      });
    }

    const order = await razorpay.orders.create(options);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (razorpay_order_id.startsWith('order_mock_')) {
      return res.json({ success: true, message: 'Mock payment verified' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400);
      throw new Error('Invalid payment signature');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay Webhook Handler
// @route   POST /api/payment/webhook
// @access  Public
export const razorpayWebhook = async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholder_webhook_secret';
    const signature = req.headers['x-razorpay-signature'];
    
    if (!signature) {
      return res.status(400).send('Signature missing');
    }

    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (generated_signature !== signature) {
      return res.status(400).send('Invalid signature');
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const paymentEntity = payload.payment.entity;
      const orderId = paymentEntity.order_id;
      // In a real flow, update DB order to mark as paid securely
      console.log(`Payment captured for order ${orderId}`);
    } else if (event === 'transfer.processed') {
      const transferEntity = payload.transfer.entity;
      console.log(`Transfer successful to ${transferEntity.recipient} for amount ${transferEntity.amount}`);
      
      const recordData = {
        transferId: transferEntity.id,
        recipient: transferEntity.recipient,
        amount: transferEntity.amount,
        status: 'success',
        processedAt: new Date().toISOString()
      };
      await db.collection('transfer_records').add(recordData);
    } else if (event === 'transfer.failed') {
      const transferEntity = payload.transfer.entity;
      console.log(`Transfer failed to ${transferEntity.recipient}`);
      
      const recordData = {
        transferId: transferEntity.id,
        recipient: transferEntity.recipient,
        amount: transferEntity.amount,
        status: 'failed',
        error: transferEntity.error_description || 'Unknown error',
        processedAt: new Date().toISOString()
      };
      await db.collection('transfer_records').add(recordData);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook Processing Error');
  }
};
