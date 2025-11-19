# Development Guide

Complete guide for developing and extending the La Factoria e-commerce platform.

## 📖 Table of Contents

1. [Project Architecture](#project-architecture)
2. [Development Workflow](#development-workflow)
3. [Adding New Features](#adding-new-features)
4. [Code Standards](#code-standards)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

## 🏛️ Project Architecture

### Backend Architecture

```
backend/
├── controllers/        # Business logic
│   ├── auth.controller.js
│   ├── product.controller.js
│   ├── cart.controller.js
│   └── ...
├── middleware/         # Request processors
│   └── auth.middleware.js
├── models/            # Database schemas
│   ├── User.model.js
│   ├── Product.model.js
│   └── ...
├── routes/            # API endpoints
│   ├── auth.routes.js
│   ├── product.routes.js
│   └── ...
├── utils/             # Helper functions
│   ├── auth.utils.js
│   └── email.utils.js
└── server.js          # Entry point
```

**Request Flow:**
```
Client Request
    ↓
Express Middleware (CORS, Helmet, Rate Limit)
    ↓
Routes (Define endpoints)
    ↓
Auth Middleware (Verify JWT, Check role)
    ↓
Controller (Business logic)
    ↓
Model (Database operations)
    ↓
Response to Client
```

### Frontend Architecture

```
frontend/src/
├── components/        # Reusable components
│   ├── layout/
│   │   ├── Header.js
│   │   └── Footer.js
│   ├── ProtectedRoute.js
│   └── AdminRoute.js
├── pages/             # Page components
│   ├── Home.js
│   ├── Shop.js
│   ├── auth/
│   ├── customer/
│   └── admin/
├── services/          # API integration
│   ├── api.js
│   └── index.js
├── store/             # State management
│   └── useStore.js
├── App.js             # Main app + routing
└── index.js           # Entry point
```

**Component Hierarchy:**
```
App
  ├── Header
  ├── Routes
  │     ├── Home
  │     ├── Shop
  │     ├── ProductDetail
  │     ├── Cart
  │     ├── Checkout
  │     ├── Customer Dashboard
  │     │     ├── Orders
  │     │     ├── Profile
  │     │     └── Addresses
  │     └── Admin Dashboard
  │           ├── Products
  │           ├── Orders
  │           └── Customers
  └── Footer
```

## 🔄 Development Workflow

### 1. Backend Development

#### Adding a New API Endpoint

**Step 1:** Create Model (if needed)
```javascript
// backend/models/Review.model.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', reviewSchema);
```

**Step 2:** Create Controller
```javascript
// backend/controllers/review.controller.js
const Review = require('../models/Review.model');
const Product = require('../models/Product.model');

// @desc    Create product review
// @route   POST /api/products/:productId/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const review = await Review.create({
      product: req.params.productId,
      user: req.user.id,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
```

**Step 3:** Create Routes
```javascript
// backend/routes/review.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const { createReview } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, createReview);

module.exports = router;
```

**Step 4:** Register Routes in server.js
```javascript
// backend/server.js
const reviewRoutes = require('./routes/review.routes');

// Mount routes
app.use('/api/products/:productId/reviews', reviewRoutes);
```

### 2. Frontend Development

#### Adding a New Page Component

**Step 1:** Create Page Component
```javascript
// frontend/src/pages/Reviews.js
import React, { useState, useEffect } from 'react';
import { reviewService } from '../services';
import './Reviews.css';

export default function Reviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const response = await reviewService.getProductReviews(productId);
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading reviews...</div>;

  return (
    <div className="reviews-section">
      <h2>Customer Reviews</h2>
      {reviews.map(review => (
        <div key={review._id} className="review-card">
          <div className="review-rating">
            {'⭐'.repeat(review.rating)}
          </div>
          <p className="review-comment">{review.comment}</p>
          <span className="review-author">
            {review.user.firstName} {review.user.lastName}
          </span>
        </div>
      ))}
    </div>
  );
}
```

**Step 2:** Add Service Method
```javascript
// frontend/src/services/index.js
export const reviewService = {
  getProductReviews: (productId) => 
    api.get(`/products/${productId}/reviews`),
  
  createReview: (productId, reviewData) =>
    api.post(`/products/${productId}/reviews`, reviewData),
};
```

**Step 3:** Add Route (if standalone page)
```javascript
// frontend/src/App.js
import Reviews from './pages/Reviews';

<Route path="/product/:slug/reviews" element={<Reviews />} />
```

## 🆕 Adding New Features

### Feature: Product Reviews

**Backend Checklist:**
- [ ] Create Review model
- [ ] Add review controller methods (create, get, update, delete)
- [ ] Create review routes
- [ ] Add authorization middleware
- [ ] Update Product model to include average rating
- [ ] Write tests

**Frontend Checklist:**
- [ ] Create Review component
- [ ] Add review form with rating stars
- [ ] Create review service methods
- [ ] Add review list to ProductDetail page
- [ ] Add styling
- [ ] Handle loading and error states

### Feature: Discount Coupons

**Backend:**
```javascript
// models/Coupon.model.js
{
  code: String (unique),
  discountType: ['percentage', 'fixed'],
  discountValue: Number,
  minOrderValue: Number,
  maxDiscount: Number,
  validFrom: Date,
  validUntil: Date,
  usageLimit: Number,
  usedCount: Number,
  isActive: Boolean
}
```

**API Endpoints:**
```
POST   /api/coupons           - Create coupon (Admin)
GET    /api/coupons           - Get all coupons (Admin)
POST   /api/coupons/validate  - Validate coupon code
DELETE /api/coupons/:id       - Delete coupon (Admin)
```

## 📏 Code Standards

### Backend

**Naming Conventions:**
```javascript
// Controllers: verb-noun pattern
exports.createProduct = async (req, res) => {};
exports.getProducts = async (req, res) => {};
exports.updateProduct = async (req, res) => {};
exports.deleteProduct = async (req, res) => {};

// Models: PascalCase
const Product = mongoose.model('Product', productSchema);

// Routes: kebab-case
router.get('/featured-products', getFeaturedProducts);

// Variables: camelCase
const productId = req.params.id;
const isAdmin = user.role === 'admin';
```

**Error Handling:**
```javascript
// Always use try-catch in async functions
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Custom error messages
if (!product) {
  return res.status(404).json({
    success: false,
    message: 'Product not found'
  });
}
```

**Response Format:**
```javascript
// Success response
{
  success: true,
  data: { /* response data */ },
  count: 10,  // For list responses
  pagination: { /* pagination info */ }  // Optional
}

// Error response
{
  success: false,
  message: 'Error description',
  error: 'Detailed error'  // Only in development
}
```

### Frontend

**Component Structure:**
```javascript
import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { productService } from '../services';
import './ComponentName.css';

export default function ComponentName({ prop1, prop2 }) {
  // 1. Hooks
  const { user } = useStore();
  const [state, setState] = useState(initialValue);
  
  // 2. Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // 3. Handlers
  const handleClick = () => {
    // Handle event
  };
  
  // 4. Render helpers
  const renderItem = (item) => {
    return <div>{item.name}</div>;
  };
  
  // 5. Main render
  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  );
}
```

**State Management:**
```javascript
// Use Zustand for global state
import useStore from '../store/useStore';

const { user, setUser, cart, setCart } = useStore();

// Use local state for component-specific data
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

**API Calls:**
```javascript
// Always handle loading and error states
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts();
      setProducts(response.data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  
  loadData();
}, []);
```

## 🧪 Testing

### Backend Testing

```javascript
// tests/product.test.js
const request = require('supertest');
const app = require('../server');

describe('Product API', () => {
  let token;
  
  beforeAll(async () => {
    // Login and get token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password' });
    token = response.body.token;
  });
  
  test('GET /api/products - should return all products', async () => {
    const response = await request(app)
      .get('/api/products')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
  
  test('POST /api/products - should create product (Admin)', async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Product',
        description: 'Test Description',
        basePrice: 100,
        category: 'rings'
      })
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Test Product');
  });
});
```

### Frontend Testing

```javascript
// src/pages/__tests__/Home.test.js
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';

test('renders home page with featured products', async () => {
  render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );
  
  expect(screen.getByText(/Featured Products/i)).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText(/Product Name/i)).toBeInTheDocument();
  });
});
```

## 🐛 Troubleshooting

### Common Backend Issues

**Issue: MongoDB Connection Failed**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Make sure MongoDB is running: `mongod`
- Check MONGODB_URI in `.env`
- Verify MongoDB port (default: 27017)

**Issue: JWT Token Invalid**
```
Error: jwt malformed
```
**Solution:**
- Check JWT_SECRET in `.env`
- Clear browser cookies
- Re-login to get new token

**Issue: Email Not Sending**
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solution:**
- Use App Password from Google Account
- Enable 2-factor authentication
- Check EMAIL_USER and EMAIL_PASS in `.env`

### Common Frontend Issues

**Issue: CORS Error**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Verify backend CORS configuration
- Check FRONTEND_URL in backend `.env`
- Restart backend server

**Issue: API Request Failed**
```
Error: Network Error
```
**Solution:**
- Check backend is running
- Verify REACT_APP_API_URL in frontend `.env`
- Check browser console for details

**Issue: State Not Updating**
```
Component not re-rendering after state change
```
**Solution:**
- Check Zustand store setup
- Verify state mutation (use immutable updates)
- Add dependencies to useEffect

## 📝 Git Workflow

### Branch Strategy

```
main              - Production-ready code
  └── develop     - Development branch
       ├── feature/product-reviews
       ├── feature/discount-coupons
       └── bugfix/cart-calculation
```

### Commit Messages

```
feat: Add product review functionality
fix: Fix cart total calculation bug
docs: Update API documentation
style: Format code with prettier
refactor: Refactor product controller
test: Add product API tests
```

## 🚀 Deployment

### Backend Deployment

1. **Prepare for production:**
```bash
# Set NODE_ENV to production
NODE_ENV=production

# Use production MongoDB (MongoDB Atlas)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/lafactoria
```

2. **Deploy to Heroku:**
```bash
heroku create lafactoria-api
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
# Set other environment variables
git push heroku main
```

### Frontend Deployment

1. **Build for production:**
```bash
npm run build
```

2. **Deploy to Vercel:**
```bash
vercel --prod
```

Or deploy to Netlify:
```bash
netlify deploy --prod --dir=build
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)

---

**Happy Developing!** 🎉
