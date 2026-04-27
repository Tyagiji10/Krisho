import express from 'express';
import {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
} from '../controllers/productController.js';
import { protect, supplier } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, supplier, createProduct);
router
  .route('/:id')
  .get(getProductById)
  .delete(protect, supplier, deleteProduct)
  .put(protect, supplier, updateProduct);

export default router;
