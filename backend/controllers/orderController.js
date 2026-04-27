import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { mockOrders, isDbConnected, generateId, mockProducts, mockUsers } from '../utils/mockData.js';

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

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    // Verify stock before proceeding
    if (!isDbConnected(mongoose)) {
      for (const item of orderItems) {
        const product = mockProducts.find(p => p._id === item.product);
        if (!product || product.stock < item.qty) {
          res.status(400);
          throw new Error(`Insufficient stock for ${item.name}`);
        }
      }
    } else {
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product || product.stock < item.qty) {
          res.status(400);
          throw new Error(`Insufficient stock for ${item.name}`);
        }
      }
    }

    // Mock Mode
    if (!isDbConnected(mongoose)) {
      const newOrder = {
        _id: generateId(),
        consumer: req.user._id,
        orderItems: orderItems.map((item) => ({
          ...item,
          product: item.product,
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: true,
        paidAt: new Date(),
        isMock: true,
        createdAt: new Date()
      };

      // Update stock, sales count, and supplier earnings in mock data
      orderItems.forEach(item => {
        const product = mockProducts.find(p => p._id === item.product);
        if (product) {
          product.stock -= item.qty;
          product.salesCount = (product.salesCount || 0) + item.qty;
          
          // Find supplier and update earnings
          const supplierId = product.supplier?._id || product.supplier;
          const supplier = mockUsers.find(u => u._id === supplierId);
          if (supplier) {
            supplier.totalEarnings = (supplier.totalEarnings || 0) + (product.price * item.qty);
          }
        }
      });

      mockOrders.push(newOrder);
      return res.status(201).json(newOrder);
    }

    const order = new Order({
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x.product,
        _id: undefined,
      })),
      consumer: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    
    // Reduce stock in DB
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.qty }
      });
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    if (!isDbConnected(mongoose)) {
      const orders = mockOrders.filter(o => o.consumer === req.user._id);
      return res.json(orders);
    }

    const orders = await Order.find({ consumer: req.user._id });
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
    if (!isDbConnected(mongoose)) {
      const order = mockOrders.find(o => o._id === req.params.id);
      if (order) return res.json(order);
      res.status(404);
      throw new Error('Order not found');
    }

    const order = await Order.findById(req.params.id).populate('consumer', 'name email');
    if (order) {
      res.json(order);
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
    if (!isDbConnected(mongoose)) {
      const orders = mockOrders.filter(o => 
        o.orderItems.some(item => item.supplier === req.user._id)
      );
      return res.json(orders);
    }

    const orders = await Order.find({
      'orderItems.supplier': req.user._id
    }).populate('consumer', 'name email city state');

    res.json(orders);
  } catch (error) {
    next(error);
  }
};
