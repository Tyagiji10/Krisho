import express from 'express';
import {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
} from '../controllers/productController.js';
import { protect, supplier } from '../middleware/authMiddleware.js';
import { cacheResponse } from '../middleware/cacheMiddleware.js';

const router = express.Router();

router.route('/').get(cacheResponse(300), getProducts).post(protect, supplier, createProduct);
router
  .route('/:id')
  .get(cacheResponse(600), getProductById)
  .delete(protect, supplier, deleteProduct)
  .put(protect, supplier, updateProduct);

export default router;
