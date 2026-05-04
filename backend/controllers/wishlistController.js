import { db } from '../config/firebaseAdmin.js';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await db.collection('wishlist')
      .where('userId', '==', req.user._id)
      .get();
    
    const items = wishlist.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    // Sort safely handling both JS Dates and Firestore Timestamps
    items.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle wishlist item
// @route   POST /api/wishlist/toggle
// @access  Private
export const toggleWishlistItem = async (req, res, next) => {
  try {
    const { product } = req.body;
    const userId = req.user._id;

    const wishlistRef = db.collection('wishlist');
    const q = await wishlistRef.where('userId', '==', req.user._id).where('productId', '==', product._id).get();

    if (!q.empty) {
      await q.docs[0].ref.delete();
    } else {
      let newItem = {
        userId: req.user._id,
        productId: product._id || product.id,
        name: product.name || 'Unknown Product',
        price: product.price || 0,
        images: Array.isArray(product.images) ? product.images.filter(Boolean) : [],
        category: product.category || 'Uncategorized',
        unit: product.unit || 'kg',
        stock: product.stock || 0,
      };
      
      if (product.supplier) {
         newItem.supplier = product.supplier._id || product.supplier.id || product.supplier;
      }

      // Deep clean to remove any nested undefined values that crash Firestore
      newItem = JSON.parse(JSON.stringify(newItem));
      newItem.createdAt = new Date();

      await wishlistRef.add(newItem);
    }

    // Return the updated wishlist immediately
    const updatedWishlist = await db.collection('wishlist')
      .where('userId', '==', req.user._id)
      .get();
    
    const items = updatedWishlist.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    // Sort safely handling both JS Dates and Firestore Timestamps
    items.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
};
