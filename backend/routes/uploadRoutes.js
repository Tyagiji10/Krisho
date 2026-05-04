import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import cloudinary from '../config/cloudinary.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    // Convert the image buffer to a base64 string
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    // Use a specific folder based on user ID if possible, else general folder
    const folderName = req.user ? `krisho_uploads/${req.user._id}` : 'krisho_uploads/general';

    // Upload directly to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folderName,
      resource_type: "auto",
      quality: "auto", // Automatically optimize quality
      fetch_format: "auto" // Automatically deliver WebP or modern formats
    });

    res.json({ 
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url 
    });

  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500).json({ message: 'Failed to upload image to cloud storage' });
  }
});

export default router;
