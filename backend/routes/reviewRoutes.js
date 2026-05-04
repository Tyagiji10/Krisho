import express from 'express';
import { createReview, getSupplierReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { cacheResponse } from '../middleware/cacheMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/:supplierId', cacheResponse(300), getSupplierReviews);

export default router;
