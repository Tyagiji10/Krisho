import { db } from '../config/firebaseAdmin.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!db) {
      res.status(500);
      throw new Error('Firebase Database not connected');
    }

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    // Verify stock and collect update operations
    const stockUpdates = [];
    for (const item of orderItems) {
      const docRef = db.collection('products').doc(item.product);
      const doc = await docRef.get();
      if (!doc.exists) {
        res.status(404);
        throw new Error(`Product not found: ${item.name}`);
      }
      const productData = doc.data();
      if (productData.stock < item.qty) {
        res.status(400);
        throw new Error(`Insufficient stock for ${item.name}`);
      }
      stockUpdates.push({ ref: docRef, newStock: productData.stock - item.qty });
    }

    const newOrder = {
      consumer: req.user._id,
      orderItems: orderItems.map((item) => ({
        ...item,
        product: item.product,
      })),
      shippingAddress,
      paymentMethod,
      itemsPrice: Number(itemsPrice),
      taxPrice: Number(taxPrice),
      shippingPrice: Number(shippingPrice),
      totalPrice: Number(totalPrice),
      isPaid: true, // Default to true for simulated checkout
      paidAt: new Date().toISOString(),
      isDelivered: false,
      createdAt: new Date().toISOString(),
    };

    // Atomic transaction for order creation and stock reduction
    const orderDocRef = await db.collection('orders').add(newOrder);
    
    // Perform stock updates
    for (const update of stockUpdates) {
      await update.ref.update({ stock: update.newStock });
    }

    res.status(201).json({ _id: orderDocRef.id, ...newOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const snapshot = await db.collection('orders').where('consumer', '==', req.user._id).get();
    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ _id: doc.id, ...doc.data() });
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const doc = await db.collection('orders').doc(req.params.id).get();
    if (doc.exists) {
      res.json({ _id: doc.id, ...doc.data() });
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders for a supplier
// @route   GET /api/orders/supplier
// @access  Private/Supplier
export const getSupplierOrders = async (req, res, next) => {
  try {
    // In Firestore, complex array queries can be tricky. We'll fetch and filter if needed, 
    // or better, restructure if we were at scale. For now, simple fetch and filter.
    const snapshot = await db.collection('orders').get();
    const orders = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const isSupplierOrder = data.orderItems.some(item => item.supplier === req.user._id);
      if (isSupplierOrder) {
        orders.push({ _id: doc.id, ...data });
      }
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Complete order
// @route   PUT /api/orders/:id/complete
// @access  Private/Supplier
export const completeOrder = async (req, res, next) => {
  try {
    console.log('PUT completeOrder called with ID:', req.params.id);
    const docRef = db.collection('orders').doc(req.params.id);
    await docRef.update({ isDelivered: true });
    res.json({ message: 'Order marked as completed' });
  } catch (error) {
    console.error('Error completing order:', error);
    next(error);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Supplier
export const deleteOrder = async (req, res, next) => {
  try {
    console.log('DELETE deleteOrder called with ID:', req.params.id);
    const docRef = db.collection('orders').doc(req.params.id);
    await docRef.delete();
    res.json({ message: 'Order removed successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    next(error);
  }
};

// @desc    Cancel an order (consumer, within 1 hour)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res, next) => {
  try {
    const docRef = db.collection('orders').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) { res.status(404); throw new Error('Order not found'); }
    const data = doc.data();
    if (data.isDelivered) { res.status(400); throw new Error('Cannot cancel a delivered order'); }
    await docRef.update({ isCancelled: true, cancelledAt: new Date().toISOString() });
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    next(error);
  }
};
