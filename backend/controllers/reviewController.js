import { db } from '../config/firebaseAdmin.js';
import { invalidateCache } from '../middleware/cacheMiddleware.js';

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res, next) => {
  try {
    const { supplierId, rating, comment } = req.body;

    if (!db) {
      res.status(500);
      throw new Error('Firebase Database not connected');
    }

    const review = {
      supplierId,
      consumerId: req.user._id,
      consumerName: req.user.name,
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString(),
    };

    await db.collection('reviews').add(review);

    // Update supplier average rating
    const reviewsSnapshot = await db.collection('reviews').where('supplierId', '==', supplierId).get();
    const reviews = reviewsSnapshot.docs.map(doc => doc.data());
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await db.collection('users').doc(supplierId).update({
      rating: avgRating,
      numReviews: reviews.length,
    });
    
    // Invalidate API response cache
    invalidateCache(`/api/reviews/${supplierId}`);

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a supplier
// @route   GET /api/reviews/:supplierId
// @access  Public
export const getSupplierReviews = async (req, res, next) => {
  try {
    const reviewsSnapshot = await db.collection('reviews')
      .where('supplierId', '==', req.params.supplierId)
      .get();

    const reviews = reviewsSnapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));

    // Sort in memory to bypass Firestore index requirement
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};
