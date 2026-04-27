import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { mockProducts, isDbConnected, generateId } from '../utils/mockData.js';

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
    const hourSeed = new Date().getHours(); // For fair rotation

    // Mock Mode Fallback
    if (!isDbConnected(mongoose)) {
      let filtered = [...mockProducts];
      
      if (keywordText) filtered = filtered.filter(p => p.name.toLowerCase().includes(keywordText.toLowerCase()));
      if (categoryText) filtered = filtered.filter(p => p.category.toLowerCase() === categoryText.toLowerCase());
      
      // Fair & Smart Sorting Logic
      filtered.sort((a, b) => {
        // 1. Proximity: City
        if (userCity) {
          const aCity = a.city === userCity;
          const bCity = b.city === userCity;
          if (aCity && !bCity) return -1;
          if (!aCity && bCity) return 1;
        }

        // 2. Proximity: State
        if (userState) {
          const aState = a.state === userState;
          const bState = b.state === userState;
          if (aState && !bState) return -1;
          if (!aState && bState) return 1;
        }

        // 3. Fair Spotlight: Hour-based rotation using supplier ID
        const aScore = (parseInt(a.supplier?._id?.toString().slice(-4), 16) || 0) % (hourSeed + 1);
        const bScore = (parseInt(b.supplier?._id?.toString().slice(-4), 16) || 0) % (hourSeed + 1);
        if (aScore !== bScore) return bScore - aScore;

        // 4. Quality: Rating
        if (a.rating !== b.rating) return b.rating - a.rating;

        // 5. Value: Price
        return a.price - b.price;
      });
      
      const count = filtered.length;
      const products = filtered.slice(pageSize * (page - 1), pageSize * page);
      
      return res.json({ products, page, pages: Math.ceil(count / pageSize), isMock: true });
    }

    const query = {
      ...(keywordText ? { name: { $regex: keywordText, $options: 'i' } } : {}),
      ...(categoryText ? { category: categoryText } : {}),
    };

    const count = await Product.countDocuments(query);
    let products = await Product.find(query)
      .populate('supplier', 'name city state profileImage rating')
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    // Dynamic Smart Sorting
    products.sort((a, b) => {
      // Proximity
      const aCity = a.supplier?.city === userCity;
      const bCity = b.supplier?.city === userCity;
      if (aCity && !bCity) return -1;
      if (!aCity && bCity) return 1;

      const aState = a.supplier?.state === userState;
      const bState = b.supplier?.state === userState;
      if (aState && !bState) return -1;
      if (!aState && bState) return 1;

      // Fair Spotlight (Hourly rotation)
      const aSeed = (parseInt(a.supplier?._id?.toString().slice(-4), 16) || 0) + hourSeed;
      const bSeed = (parseInt(b.supplier?._id?.toString().slice(-4), 16) || 0) + hourSeed;
      if (Math.sin(aSeed) > Math.sin(bSeed)) return -1;
      if (Math.sin(aSeed) < Math.sin(bSeed)) return 1;

      // Rating
      if (a.rating !== b.rating) return b.rating - a.rating;

      // Price
      return a.price - b.price;
    });

    res.json({ products, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    if (!isDbConnected(mongoose)) {
      const product = mockProducts.find(p => p._id === req.params.id);
      if (product) {
        return res.json(product);
      } else {
        res.status(404);
        throw new Error('Product not found (Mock Mode)');
      }
    }

    const product = await Product.findById(req.params.id).populate('supplier', 'name email state city');

    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Supplier
export const deleteProduct = async (req, res, next) => {
  try {
    if (!isDbConnected(mongoose)) {
      const index = mockProducts.findIndex(p => p._id === req.params.id);
      if (index !== -1) {
        mockProducts.splice(index, 1);
        return res.json({ message: 'Product removed (Mock Mode)' });
      } else {
        res.status(404);
        throw new Error('Product not found (Mock Mode)');
      }
    }

    const product = await Product.findById(req.params.id);

    if (product) {
      if (product.supplier.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized to delete this product');
      }
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
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

    if (!isDbConnected(mongoose)) {
      const newProduct = {
        _id: generateId(),
        name,
        price: Number(price),
        description,
        images,
        category,
        stock: Number(stock),
        unit,
        hashtags,
        supplier: { 
          _id: req.user._id, 
          name: req.user.name, 
          city: req.body.city || req.user.city, 
          state: req.body.state || req.user.state 
        },
        city: req.body.city || req.user.city,
        state: req.body.state || req.user.state,
        isMock: true
      };
      mockProducts.push(newProduct);
      return res.status(201).json(newProduct);
    }

    const product = new Product({
      name,
      price: Number(price),
      supplier: req.user._id,
      images,
      category,
      stock: Number(stock),
      unit,
      description,
      hashtags
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
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

    if (!isDbConnected(mongoose)) {
      const product = mockProducts.find(p => p._id === req.params.id);
      if (product) {
        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.images = images || product.images;
        product.category = category || product.category;
        product.stock = stock || product.stock;
        product.unit = unit || product.unit;
        product.hashtags = hashtags || product.hashtags;
        return res.json(product);
      } else {
        res.status(404);
        throw new Error('Product not found (Mock Mode)');
      }
    }

    const product = await Product.findById(req.params.id);

    if (product) {
      if (product.supplier.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized to update this product');
      }
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.images = images || product.images;
      product.category = category || product.category;
      product.stock = stock || product.stock;
      product.unit = unit || product.unit;
      product.hashtags = hashtags || product.hashtags;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};
