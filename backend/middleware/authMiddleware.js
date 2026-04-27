import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { mockUsers, isDbConnected } from '../utils/mockData.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!isDbConnected(mongoose)) {
        const user = mockUsers.find(u => u._id.toString() === decoded.id.toString());
        if (user) {
          req.user = user;
          return next();
        } else {
          // Graceful fallback for mock mode if server restarted and lost in-memory user
          req.user = { 
            _id: decoded.id, 
            name: 'Active Supplier', 
            role: 'supplier',
            city: 'Amritsar', 
            state: 'Punjab',
            isMock: true 
          };
          return next();
        }
      }

      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const supplier = (req, res, next) => {
  if (req.user && req.user.role === 'supplier') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a supplier' });
  }
};

export const consumer = (req, res, next) => {
  if (req.user && req.user.role === 'consumer') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a consumer' });
  }
};
