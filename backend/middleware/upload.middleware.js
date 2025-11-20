/**
 * Upload Middleware for File Storage
 * 
 * IMPORTANT NOTES FOR VERCEL:
 * - Vercel serverless functions have read-only filesystem
 * - Only /tmp directory is writable (max 512MB)
 * - Files in /tmp are deleted after function execution
 * - For production, use cloud storage: Cloudinary, AWS S3, or Vercel Blob
 * 
 * Current Setup:
 * - Local development: ./uploads/products
 * - Vercel: /tmp/uploads/products (temporary, gets cleared)
 * 
 * Recommended for Production:
 * - Use Cloudinary (free tier: 25GB storage, 25GB bandwidth)
 * - Or AWS S3 / Google Cloud Storage
 * - Or Vercel Blob Storage
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Determine upload directory based on environment
// Vercel uses read-only filesystem, only /tmp is writable
const isVercel = process.env.VERCEL || process.env.NOW_REGION;
const uploadDir = isVercel 
  ? '/tmp/uploads/products' 
  : path.join(__dirname, '../uploads/products');

// Create uploads directory if it doesn't exist
// Only try to create if not in Vercel (Vercel /tmp is always writable)
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`📁 Upload directory created: ${uploadDir}`);
  }
} catch (error) {
  console.warn('⚠️  Could not create upload directory:', error.message);
  console.warn('   File uploads may not work on this platform');
  console.warn('   Consider using cloud storage (Cloudinary, AWS S3, etc.)');
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // For Vercel, ensure /tmp/uploads/products exists on each request
    if (isVercel && !fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
      } catch (error) {
        console.error('Failed to create upload directory:', error);
      }
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
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

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
