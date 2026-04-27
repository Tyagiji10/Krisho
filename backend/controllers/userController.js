import mongoose from 'mongoose';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { mockUsers, isDbConnected, generateId } from '../utils/mockData.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const authUser = async (req, res, next) => {
  try {
    const { email, password, firebaseUid } = req.body;

    // DB Check and Fallback
    if (!isDbConnected(mongoose)) {
      let user = null;
      if (firebaseUid) {
        user = mockUsers.find(u => u.firebaseUid === firebaseUid);
      }
      if (!user) {
        user = mockUsers.find(u => u.email === email);
      }

      if (user) {
        if (firebaseUid && !user.firebaseUid) user.firebaseUid = firebaseUid;
        
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          city: user.city,
          state: user.state,
          profileImage: user.profileImage,
          rating: user.rating || 4.5,
          token: generateToken(user._id),
          isMock: true
        });
      } else {
        res.status(401);
        throw new Error('User profile not found (Mock Mode)');
      }
    }

    let user = null;
    if (firebaseUid) {
      user = await User.findOne({ firebaseUid });
    }
    if (!user) {
      user = await User.findOne({ email });
    }

    if (user) {
      if (firebaseUid && !user.firebaseUid) {
        user.firebaseUid = firebaseUid;
        await user.save();
      }
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        state: user.state,
        profileImage: user.profileImage,
        rating: user.rating || 4.5,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('User profile not found in database');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, state, city, firebaseUid } = req.body;

    // DB Check and Fallback
    if (!isDbConnected(mongoose)) {
      const userExists = mockUsers.find(u => u.email === email);
      if (userExists) {
        res.status(400);
        const roleText = userExists.role === 'supplier' ? 'a Supplier' : 'a Consumer';
        throw new Error(`This email is already registered as ${roleText} account. (Mock Mode)`);
      }

      const newUser = {
        _id: generateId(),
        name,
        email,
        password,
        firebaseUid,
        role,
        state,
        city
      };
      mockUsers.push(newUser);

      return res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        city: newUser.city,
        state: newUser.state,
        profileImage: newUser.profileImage,
        rating: newUser.rating || 4.5,
        token: generateToken(newUser._id),
        isMock: true
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      const roleText = userExists.role === 'supplier' ? 'a Supplier' : 'a Consumer';
      throw new Error(`This email is already registered as ${roleText} account.`);
    }

    const user = await User.create({
      name,
      email,
      password,
      firebaseUid,
      role,
      state,
      city
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        state: user.state,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user via Google
// @route   POST /api/users/google-login
// @access  Public
export const googleLogin = async (req, res, next) => {
  try {
    const { name, email, firebaseUid, photo } = req.body;

    // DB Check and Fallback
    if (!isDbConnected(mongoose)) {
      let user = mockUsers.find(u => u.email === email);
      if (!user) {
        user = {
          _id: generateId(),
          name,
          email,
          firebaseUid,
          role: 'consumer',
          isMock: true
        };
        mockUsers.push(user);
      }
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        state: user.state,
        token: generateToken(user._id),
        isMock: true
      });
    }

    let user = await User.findOne({ email });

    if (user) {
      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUid;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        firebaseUid,
        profileImage: photo,
        role: 'consumer',
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.city,
      state: user.state,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    // Check Mock Mode
    if (!isDbConnected(mongoose)) {
      const user = mockUsers.find(u => u._id.toString() === req.user._id.toString());
      if (user) {
        return res.json(user);
      } else {
        res.status(404);
        throw new Error('User not found (Mock Mode)');
      }
    }

    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        state: user.state,
        city: user.city,
        profileImage: user.profileImage,
        rating: user.rating || 4.5,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};
// @desc    Update user profile (Onboarding)
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const { role, state, city, profileImage } = req.body;
    
    if (!isDbConnected(mongoose)) {
      const user = mockUsers.find(u => u._id.toString() === req.user._id.toString());
      if (user) {
        user.role = role || user.role;
        user.state = state || user.state;
        user.city = city || user.city;
        user.profileImage = profileImage !== undefined ? profileImage : user.profileImage;
        if (!user.rating) user.rating = 4.5;
        return res.json({
          ...user,
          token: generateToken(user._id)
        });
      }
      res.status(404);
      throw new Error('User not found');
    }

    const user = await User.findById(req.user._id);
    if (user) {
      user.role = role || user.role;
      user.state = state || user.state;
      user.city = city || user.city;
      user.profileImage = profileImage || user.profileImage;
      
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        state: updatedUser.state,
        city: updatedUser.city,
        profileImage: updatedUser.profileImage,
        rating: updatedUser.rating,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user profile
// @route   DELETE /api/users/profile
// @access  Private
export const deleteUserProfile = async (req, res, next) => {
  try {
    if (!isDbConnected(mongoose)) {
      const userIndex = mockUsers.findIndex(u => u._id.toString() === req.user._id.toString());
      if (userIndex !== -1) {
        mockUsers.splice(userIndex, 1);
        return res.json({ message: 'User deleted successfully (Mock Mode)' });
      }
      res.status(404);
      throw new Error('User not found');
    }

    const user = await User.findById(req.user._id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user payment details
// @route   PUT /api/users/payment
// @access  Private/Supplier
export const updatePaymentDetails = async (req, res, next) => {
  try {
    const { upiId, bankName, accountNumber, ifscCode } = req.body;

    if (!isDbConnected(mongoose)) {
      const user = mockUsers.find(u => u._id.toString() === req.user._id.toString());
      if (user) {
        user.paymentDetails = { upiId, bankName, accountNumber, ifscCode };
        return res.json(user);
      }
    }

    const user = await User.findById(req.user._id);

    if (user) {
      user.paymentDetails = {
        upiId: upiId || user.paymentDetails?.upiId,
        bankName: bankName || user.paymentDetails?.bankName,
        accountNumber: accountNumber || user.paymentDetails?.accountNumber,
        ifscCode: ifscCode || user.paymentDetails?.ifscCode,
      };

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};
