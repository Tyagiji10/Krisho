import { db } from '../config/firebaseAdmin.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const authUser = async (req, res, next) => {
  try {
    const { email, firebaseUid } = req.body;

    if (!db) {
      res.status(500);
      throw new Error('Firebase Database not connected');
    }

    let userDoc = null;
    if (firebaseUid) {
      userDoc = await db.collection('users').doc(firebaseUid).get();
    }

    if (!userDoc || !userDoc.exists) {
      // Try searching by email if UID doc not found (legacy or first login)
      const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
      if (!userSnapshot.empty) {
        userDoc = userSnapshot.docs[0];
      }
    }

    if (userDoc && userDoc.exists) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      // Update firebaseUid if it was missing
      if (firebaseUid && userData.firebaseUid !== firebaseUid) {
        await db.collection('users').doc(userId).update({ firebaseUid });
      }

      res.json({
        _id: userId,
        ...userData,
        token: generateToken(userId),
      });
    } else {
      res.status(401);
      throw new Error('User profile not found in Firebase. Please register first.');
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
    const { name, email, role, state, city, firebaseUid } = req.body;

    if (!db) {
      res.status(500);
      throw new Error('Firebase Database not connected');
    }

    // Check if user exists
    const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
    if (!userSnapshot.empty) {
      res.status(400);
      throw new Error('This email is already registered.');
    }

    const newUser = {
      name,
      email,
      firebaseUid,
      role,
      state,
      city,
      profileImage: '',
      rating: role === 'supplier' ? 4.5 : 0,
      createdAt: new Date().toISOString(),
    };

    // Use firebaseUid as Document ID if available
    const docId = firebaseUid || email;
    await db.collection('users').doc(docId).set(newUser);

    res.status(201).json({
      _id: docId,
      ...newUser,
      token: generateToken(docId),
    });
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

    if (!db) {
      res.status(500);
      throw new Error('Firebase Database not connected');
    }

    let userDoc = await db.collection('users').doc(firebaseUid).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      res.json({
        _id: firebaseUid,
        ...userData,
        token: generateToken(firebaseUid),
      });
    } else {
      // Create new user
      const newUser = {
        name,
        email,
        firebaseUid,
        profileImage: photo || '',
        role: 'consumer', // Default role
        rating: 0,
        createdAt: new Date().toISOString(),
      };
      await db.collection('users').doc(firebaseUid).set(newUser);

      res.json({
        _id: firebaseUid,
        ...newUser,
        token: generateToken(firebaseUid),
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user._id).get();

    if (userDoc.exists) {
      res.json({
        _id: userDoc.id,
        ...userDoc.data(),
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const { role, state, city, profileImage } = req.body;
    const userRef = db.collection('users').doc(req.user._id);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const updateData = {};
      if (role) updateData.role = role;
      if (state) updateData.state = state;
      if (city) updateData.city = city;
      if (profileImage !== undefined) updateData.profileImage = profileImage;

      await userRef.update(updateData);
      const updatedDoc = await userRef.get();

      res.json({
        _id: updatedDoc.id,
        ...updatedDoc.data(),
        token: generateToken(updatedDoc.id),
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
    await db.collection('users').doc(req.user._id).delete();
    res.json({ message: 'User deleted successfully' });
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
    const userRef = db.collection('users').doc(req.user._id);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const paymentDetails = {
        upiId: upiId || '',
        bankName: bankName || '',
        accountNumber: accountNumber || '',
        ifscCode: ifscCode || '',
      };
      await userRef.update({ paymentDetails });
      const updatedDoc = await userRef.get();
      res.json(updatedDoc.data());
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};
