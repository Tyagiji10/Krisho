import express from 'express';
import { createReview, getSupplierReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/:supplierId', getSupplierReviews);

export default router;
