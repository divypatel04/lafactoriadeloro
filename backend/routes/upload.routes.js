const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { protect, authorize } = require('../middleware/auth.middleware');
const path = require('path');

// Public upload endpoint for custom ring images (no auth required)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    // Return Cloudinary URL (already optimized and CDN-served)
    const imageUrl = req.file.path; // Cloudinary URL
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      url: imageUrl,
      filename: req.file.filename || req.file.public_id,
      cloudinary: true
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Upload single image (for categories, etc.)
router.post('/single', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    // Return Cloudinary URL
    const imageUrl = req.file.path;
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      url: imageUrl,
      filename: req.file.filename || req.file.public_id,
      cloudinary: true
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Upload single product image
router.post('/product-image', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get material (color) from request body
    const material = req.body.material || null;

    // Return Cloudinary URL
    const imageUrl = req.file.path;
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      image: {
        url: imageUrl,
        material: material,
        filename: req.file.filename || req.file.public_id,
        cloudinary: true
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Upload multiple product images
router.post('/product-images', protect, authorize('admin'), upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Parse materials array from request body
    const materials = req.body.materials ? JSON.parse(req.body.materials) : [];

    // Map uploaded files to image objects with Cloudinary URLs
    const images = req.files.map((file, index) => ({
      url: file.path, // Cloudinary URL
      material: materials[index] || null,
      filename: file.filename || file.public_id,
      cloudinary: true
    }));

    res.status(200).json({
      success: true,
      message: `${images.length} images uploaded successfully`,
      images: images
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete product image from Cloudinary
router.delete('/product-image/:publicId', protect, authorize('admin'), async (req, res) => {
  try {
    const cloudinary = require('../config/cloudinary.config');
    const publicId = req.params.publicId;

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(`lafactoria/products/${publicId}`);

    if (result.result === 'ok' || result.result === 'not found') {
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
        result: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete image',
        result: result
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;
