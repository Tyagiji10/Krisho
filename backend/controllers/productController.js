import { db } from '../config/firebaseAdmin.js';
import cache from '../utils/cache.js';
import { getMultilingualKeywords } from '../utils/gemini.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;
    const keywordText = req.query.keyword || '';
    const categoryText = req.query.category || '';
    const userCity = req.query.city || '';
    const userState = req.query.state || '';
    const hourSeed = new Date().getHours();
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
    const sortBy = req.query.sortBy || 'smart'; // 'smart' | 'price_asc' | 'price_desc' | 'newest' | 'rating'

    if (!db) {
      res.status(500);
      throw new Error('Firebase Database not connected');
    }

    let products = cache.get('all_products');

    if (!products) {
      console.log('🔄 Cache Miss: Fetching products from Firestore...');
      products = [];
      const snapshot = await db.collection('products').get();
      snapshot.forEach(doc => {
        products.push({ _id: doc.id, ...doc.data() });
      });
      cache.set('all_products', products);
    } else {
      console.log('⚡ Cache Hit: Serving products from memory');
    }

    if (keywordText) {
      const expandedKeywords = await getMultilingualKeywords(keywordText);
      
      const getStringSimilarity = (str1, str2) => {
        const s1 = str1.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '').replace(/\s+/g, '');
        const s2 = str2.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '').replace(/\s+/g, '');
        
        if (s1 === s2) return 1.0;
        if (s1.length < 2 || s2.length < 2) return 0.0;

        const bigrams1 = new Map();
        for (let i = 0; i < s1.length - 1; i++) {
          const bigram = s1.slice(i, i + 2);
          const count = bigrams1.has(bigram) ? bigrams1.get(bigram) + 1 : 1;
          bigrams1.set(bigram, count);
        }

        let intersection = 0;
        for (let i = 0; i < s2.length - 1; i++) {
          const bigram = s2.slice(i, i + 2);
          const count = bigrams1.has(bigram) ? bigrams1.get(bigram) : 0;
          if (count > 0) {
            bigrams1.set(bigram, count - 1);
            intersection++;
          }
        }

        return (2.0 * intersection) / (s1.length + s2.length - 2);
      };

      products = products.filter(p => {
        const prodName = p.name.toLowerCase();
        const hashtags = (p.hashtags || []).map(h => h.toLowerCase());

        return expandedKeywords.some(key => {
          if (prodName.includes(key) || key.includes(prodName)) return true;
          if (hashtags.some(h => h.includes(key) || key.includes(h))) return true;

          if (getStringSimilarity(p.name, key) >= 0.70) return true;

          const prodWords = prodName.split(/\s+/);
          const keyWords = key.split(/\s+/);

          return prodWords.some(pw => 
            keyWords.some(kw => kw.length > 1 && (pw.includes(kw) || kw.includes(pw)))
          );
        });
      });
    }
    if (categoryText) {
      products = products.filter(p => p.category.toLowerCase() === categoryText.toLowerCase());
    }

    // Price range filter
    if (minPrice !== null) products = products.filter(p => p.price >= minPrice);
    if (maxPrice !== null) products = products.filter(p => p.price <= maxPrice);

    const count = products.length;

    // Sorting
    if (sortBy === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'rating') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // Smart sort (default: proximity + randomized)
      products.sort((a, b) => {
        const aSupplierCity = a.supplier?.city || a.city;
        const bSupplierCity = b.supplier?.city || b.city;
        const aSupplierState = a.supplier?.state || a.state;
        const bSupplierState = b.supplier?.state || b.state;
        const aSupplierId = a.supplier?._id || a.supplier || '0';
        const bSupplierId = b.supplier?._id || b.supplier || '0';

        const aCity = aSupplierCity === userCity;
        const bCity = bSupplierCity === userCity;
        if (aCity && !bCity) return -1;
        if (!aCity && bCity) return 1;

        const aState = aSupplierState === userState;
        const bState = bSupplierState === userState;
        if (aState && !bState) return -1;
        if (!aState && bState) return 1;

        const aSeed = (parseInt(aSupplierId.toString().slice(-4), 16) || 0) + hourSeed;
        const bSeed = (parseInt(bSupplierId.toString().slice(-4), 16) || 0) + hourSeed;
        if (Math.sin(aSeed) > Math.sin(bSeed)) return -1;
        if (Math.sin(aSeed) < Math.sin(bSeed)) return 1;

        if ((a.rating || 0) !== (b.rating || 0)) return (b.rating || 0) - (a.rating || 0);
        return a.price - b.price;
      });
    }

    const paginatedProducts = products.slice(pageSize * (page - 1), pageSize * page);
    res.json({ products: paginatedProducts, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const cacheKey = `product_${req.params.id}`;
    let product = cache.get(cacheKey);

    if (product) {
      return res.json(product);
    }

    const doc = await db.collection('products').doc(req.params.id).get();
    if (doc.exists) {
      product = { _id: doc.id, ...doc.data() };
      cache.set(cacheKey, product);
      return res.json(product);
    }
    
    res.status(404);
    throw new Error('Product not found');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Supplier
export const deleteProduct = async (req, res, next) => {
  try {
    const docRef = db.collection('products').doc(req.params.id);
    const doc = await docRef.get();
    if (doc.exists) {
      const data = doc.data();
      if (data.supplier._id !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized to delete this product');
      }
      await docRef.delete();
      
      // Invalidate cache
      cache.del('all_products');
      cache.del(`product_${req.params.id}`);
      
      return res.json({ message: 'Product removed' });
    }

    res.status(404);
    throw new Error('Product not found');
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Supplier
export const createProduct = async (req, res, next) => {
  try {
    const { name, price, description, images, category, stock, unit, hashtags } = req.body;

    const newProductData = {
      name,
      price: Number(price),
      description,
      images: images || [],
      category,
      stock: Number(stock),
      unit,
      hashtags: hashtags || [],
      supplier: { 
        _id: req.user._id.toString(), 
        name: req.user.name, 
        city: req.body.city || req.user.city, 
        state: req.body.state || req.user.state 
      },
      city: req.body.city || req.user.city,
      state: req.body.state || req.user.state,
      rating: 0,
      numReviews: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('products').add(newProductData);
    
    // Invalidate cache
    cache.del('all_products');
    
    return res.status(201).json({ _id: docRef.id, ...newProductData });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Supplier
export const updateProduct = async (req, res, next) => {
  try {
    const { name, price, description, images, category, stock, unit, hashtags } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (price) updateData.price = Number(price);
    if (description) updateData.description = description;
    if (images) updateData.images = images;
    if (category) updateData.category = category;
    if (stock) updateData.stock = Number(stock);
    if (unit) updateData.unit = unit;
    if (hashtags) updateData.hashtags = hashtags;
    updateData.updatedAt = new Date().toISOString();

    const docRef = db.collection('products').doc(req.params.id);
    const doc = await docRef.get();
    if (doc.exists) {
      if (doc.data().supplier._id !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized to update this product');
      }
      await docRef.update(updateData);
      
      // Invalidate cache
      cache.del('all_products');
      cache.del(`product_${req.params.id}`);
      
      const updatedDoc = await docRef.get();
      return res.json({ _id: updatedDoc.id, ...updatedDoc.data() });
    }

    res.status(404);
    throw new Error('Product not found');
  } catch (error) {
    next(error);
  }
};
