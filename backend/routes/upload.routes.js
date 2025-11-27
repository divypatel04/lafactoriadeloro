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

    // Return file URL
    const imageUrl = `/uploads/products/${req.file.filename}`;
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      url: imageUrl,
      filename: req.file.filename
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

    // Return file URL
    const imageUrl = `/uploads/products/${req.file.filename}`;
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      url: imageUrl,
      filename: req.file.filename
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

    // Return file info
    const imageUrl = `/uploads/products/${req.file.filename}`;
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      image: {
        url: imageUrl,
        material: material,
        filename: req.file.filename
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

    // Map uploaded files to image objects
    const images = req.files.map((file, index) => ({
      url: `/uploads/products/${file.filename}`,
      material: materials[index] || null,
      filename: file.filename
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

// Delete product image
router.delete('/product-image/:filename', protect, authorize('admin'), async (req, res) => {
  try {
    const fs = require('fs');
    const isVercel = process.env.VERCEL || process.env.NOW_REGION;
    const uploadsDir = isVercel ? '/tmp/uploads/products' : path.join(__dirname, '../uploads/products');
    const filePath = path.join(uploadsDir, req.params.filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
