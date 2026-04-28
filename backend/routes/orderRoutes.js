import express from 'express';
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  getSupplierOrders,
  completeOrder,
  deleteOrder,
  cancelOrder
} from '../controllers/orderController.js';
import { protect, supplier } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, addOrderItems);
router.get('/myorders', protect, getMyOrders);
router.get('/supplier', protect, supplier, getSupplierOrders);
router.get('/:id', protect, getOrderById);
router.delete('/:id', protect, deleteOrder);
router.put('/:id/complete', protect, completeOrder);
router.put('/:id/cancel', protect, cancelOrder);

export default router;
