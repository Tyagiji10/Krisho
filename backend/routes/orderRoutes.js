import express from 'express';
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  getSupplierOrders,
} from '../controllers/orderController.js';
import { protect, supplier } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addOrderItems);
router.route('/myorders').get(protect, getMyOrders);
router.route('/supplier').get(protect, supplier, getSupplierOrders);
router.route('/:id').get(protect, getOrderById);

export default router;
