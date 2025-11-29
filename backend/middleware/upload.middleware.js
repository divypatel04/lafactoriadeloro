/**
 * Upload Middleware - Cloudinary Storage
 * 
 * Uses Cloudinary for reliable cloud storage across all environments.
 * Images are automatically optimized and served via CDN.
 * 
 * Environment Variables Required:
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 */

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary.config');
const path = require('path');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lafactoria/products', // Folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1500, height: 1500, crop: 'limit' }, // Max dimensions
      { quality: 'auto' }, // Automatic quality optimization
      { fetch_format: 'auto' } // Automatic format optimization (WebP for modern browsers)
    ],
    public_id: (req, file) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname).toLowerCase();
      return `product-${uniqueSuffix}${ext}`;
    }
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
  }
};

// Configure multer with Cloudinary storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit (Cloudinary can handle larger files)
  },
  fileFilter: fileFilter
});

console.log('☁️  Upload middleware configured with Cloudinary storage');

module.exports = upload;
