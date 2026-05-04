import Razorpay from 'razorpay';
import crypto from 'crypto';
import { db } from '../config/firebaseAdmin.js';

// Lazy initialization of Razorpay to ensure env vars are loaded
let razorpayInstance = null;
const getRazorpay = () => {
  if (!razorpayInstance) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || key_id === 'rzp_test_placeholder' || key_id === 'your_razorpay_key_id') {
      console.log('⚠️  Razorpay keys missing or using placeholders. Entering Mock Mode.');
      console.log('DEBUG: key_id is:', key_id);
      return null;
    }

    console.log(`✅ Razorpay initialized with key starting with: ${key_id.substring(0, 8)}...`);
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
    console.log('✅ Razorpay initialized with real keys.');
  }
  return razorpayInstance;
};

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

    const rzp = getRazorpay();

    // If using mock placeholders or keys missing, bypass external API
    if (!rzp) {
      return res.status(201).json({
        id: `order_mock_${Date.now()}`,
        amount: options.amount,
        currency: 'INR',
        mock: true,
        transfers_configured: options.transfers ? true : false
      });
    }

    const order = await rzp.orders.create(options);
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
