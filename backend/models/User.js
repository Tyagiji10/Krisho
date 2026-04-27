import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    // Optional if using Google Auth primarily, but required for email flow
  },
  role: {
    type: String,
    enum: ['consumer', 'supplier'],
    required: true,
  },
  state: String,
  city: String,
  profileImage: String,
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true,
    default: undefined,
  },
  paymentDetails: {
    upiId: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
