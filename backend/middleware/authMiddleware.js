import jwt from 'jsonwebtoken';
import { db } from '../config/firebaseAdmin.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!db) {
        // Emergency fallback if Firestore not connected but token is valid
        req.user = { 
          _id: decoded.id, 
          name: 'Authorized User', 
          role: 'consumer' 
        };
        return next();
      }

      const userDoc = await db.collection('users').doc(decoded.id).get();
      
      if (userDoc.exists) {
        req.user = { _id: userDoc.id, ...userDoc.data() };
        next();
      } else {
        res.status(401).json({ message: 'User not found in Firebase' });
      }
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
