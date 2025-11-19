# La Factoria del Oro - E-commerce Platform

A modern, full-stack e-commerce platform for jewelry and rings, built with React.js and Node.js.

## 🏗️ Project Structure

```
la-factoria-ecommerce/
├── backend/                 # Node.js + Express API
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Authentication & validation
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── utils/             # Helper functions
│   └── server.js          # Entry point
│
└── frontend/               # React.js application
    ├── public/            # Static assets
    └── src/
        ├── components/    # Reusable components
        ├── pages/         # Page components
        ├── services/      # API integration
        ├── store/         # State management (Zustand)
        └── App.js         # Main application
```

## ✨ Features

### Customer Features
- ✅ Browse products by categories, materials, purity, weight, and price
- ✅ Product search with filters
- ✅ High-resolution product images with zoom
- ✅ Product variants (material, karat, weight with individual pricing & SKU)
- ✅ Shopping cart with quantity management
- ✅ Wishlist functionality
- ✅ User registration & authentication
- ✅ Customer dashboard with order tracking
- ✅ Multiple shipping addresses
- ✅ Email notifications (order confirmation, shipping updates)

### Admin Features
- ✅ Admin dashboard with sales statistics
- ✅ Product management (CRUD operations)
- ✅ Product variant management
- ✅ Category management with hierarchy
- ✅ Order management with status updates
- ✅ Customer management
- ✅ Inventory tracking
- ✅ Image upload for products

### Technical Features
- ✅ RESTful API architecture
- ✅ JWT-based authentication
- ✅ Role-based authorization (Customer/Admin)
- ✅ MongoDB database with Mongoose ODM
- ✅ File upload with Multer
- ✅ Email notifications with Nodemailer
- ✅ Responsive design matching WordPress theme
- ✅ State management with Zustand
- ✅ API rate limiting & security (Helmet, CORS)

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js (v16+)
- **Framework:** Express.js 4.18
- **Database:** MongoDB 4.4+
- **ODM:** Mongoose 8.0
- **Authentication:** JWT (jsonwebtoken 9.0)
- **Password Hashing:** bcryptjs 2.4
- **Email:** Nodemailer 6.9
- **File Upload:** Multer 1.4
- **Validation:** express-validator 7.0
- **Security:** Helmet 7.1, CORS 2.8, express-rate-limit 7.1

### Frontend
- **Library:** React 18.2
- **Routing:** React Router DOM 6.20
- **State Management:** Zustand 4.4
- **HTTP Client:** Axios 1.6
- **Notifications:** React Toastify 9.1
- **Carousel:** React Slick 0.29
- **Styling:** CSS3 with custom variables

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd d:/Projects/lafactoriadeloro/la-factoria-ecommerce
```

2. **Setup Backend**
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/lafactoria
# JWT_SECRET=your-secret-key-here
# JWT_EXPIRE=7d
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password
# FRONTEND_URL=http://localhost:3000
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
```

4. **Start MongoDB**
```bash
# Make sure MongoDB is running on localhost:27017
mongod
```

5. **Run the Application**

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend will run on `http://localhost:3000`

## 📋 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/logout            - Logout user
GET    /api/auth/me                - Get current user
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password with token
```

### Product Endpoints
```
GET    /api/products               - Get all products (with filters)
GET    /api/products/featured      - Get featured products
GET    /api/products/:slug         - Get product by slug
POST   /api/products               - Create product (Admin)
PUT    /api/products/:id           - Update product (Admin)
DELETE /api/products/:id           - Delete product (Admin)
```

### Cart Endpoints
```
GET    /api/cart                   - Get user's cart
POST   /api/cart                   - Add item to cart
PUT    /api/cart/:itemId           - Update cart item quantity
DELETE /api/cart/:itemId           - Remove item from cart
DELETE /api/cart                   - Clear cart
```

### Order Endpoints
```
POST   /api/orders                 - Create new order
GET    /api/orders/my-orders       - Get user's orders
GET    /api/orders/:id             - Get order details
PUT    /api/orders/:id/cancel      - Cancel order
```

### Admin Endpoints
```
GET    /api/admin/stats            - Get dashboard statistics
GET    /api/admin/orders           - Get all orders
PUT    /api/admin/orders/:id       - Update order status
GET    /api/admin/customers        - Get all customers
GET    /api/admin/products/low-stock - Get low stock products
```

For complete API documentation, see [backend/README.md](backend/README.md)

## 🎨 Design System

### Colors
- **Primary:** #222222 (Black)
- **Secondary:** #FFFFFF (White)
- **Text:** #777777 (Gray)
- **Accent:** #D4AF37 (Gold - for CTAs)
- **Error:** #E74C3C
- **Success:** #27AE60

### Typography
- **Font Family:** Jost, sans-serif
- **Headings:** 400 weight
- **Body:** 400 weight
- **Buttons:** 500 weight

### Breakpoints
- **Desktop:** 1024px+
- **Tablet:** 768px - 1023px
- **Mobile:** < 768px

## 📦 Database Schema

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: ['customer', 'admin'],
  addresses: [{ type, street, city, state, zipCode, country }],
  wishlist: [ProductId],
  createdAt: Date
}
```

### Product Model
```javascript
{
  name: String,
  slug: String (unique),
  description: String,
  basePrice: Number,
  category: CategoryId,
  images: [{ url, alt }],
  variants: [{
    material: String,
    purity: String,
    weight: Number,
    price: Number,
    sku: String,
    stock: Number
  }],
  specifications: [{ key, value }],
  isFeatured: Boolean,
  isActive: Boolean
}
```

### Order Model
```javascript
{
  user: UserId,
  orderNumber: String (unique),
  items: [{
    product: ProductId,
    variant: Object,
    quantity: Number,
    price: Number
  }],
  shippingAddress: Object,
  paymentStatus: ['pending', 'completed', 'failed'],
  orderStatus: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  totalAmount: Number,
  trackingNumber: String
}
```

## 🔒 Security Features

- JWT-based authentication with HTTP-only cookies
- Password hashing with bcryptjs (10 rounds)
- Role-based authorization middleware
- API rate limiting (100 requests per 15 minutes)
- Helmet.js for HTTP headers security
- CORS configuration for API access
- Input validation with express-validator
- MongoDB injection prevention with Mongoose
- XSS protection in user inputs

## 📧 Email Templates

The platform sends automated emails for:
- ✅ Welcome email on registration
- ✅ Order confirmation with details
- ✅ Order status updates (processing, shipped, delivered)
- ✅ Password reset with secure token link

## 🚧 Development Status

### ✅ Completed
- Backend API (100%)
- Database models & relationships
- Authentication & authorization
- Email notification system
- Frontend project structure
- Layout components (Header, Footer)
- State management setup
- API service layer
- Basic page structure

### 🔄 In Progress
- Page component implementation
- Product filtering & search UI
- Shopping cart UI
- Checkout flow
- Customer dashboard
- Admin dashboard

### 📋 Upcoming
- Product image zoom feature
- Advanced product filters
- Order tracking UI
- Customer reviews & ratings
- Payment gateway integration (future)
- Advanced analytics dashboard

## 🧪 Testing

```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

## 🌐 Deployment

### Backend Deployment
1. Set environment variables on your server
2. Build and start the application:
```bash
npm run build
npm start
```

### Frontend Deployment
1. Build the production bundle:
```bash
npm run build
```
2. Deploy the `build/` folder to your hosting service (Netlify, Vercel, etc.)

### Recommended Services
- **Backend:** Heroku, DigitalOcean, AWS EC2
- **Frontend:** Vercel, Netlify, AWS S3 + CloudFront
- **Database:** MongoDB Atlas
- **File Storage:** AWS S3, Cloudinary

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lafactoria
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=La Factoria del Oro <noreply@lafactoria.com>
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 👥 User Roles

### Customer
- Browse products
- Add to cart & wishlist
- Place orders
- Track orders
- Manage profile & addresses

### Admin
- All customer permissions
- Manage products (CRUD)
- Manage categories
- Manage orders (update status, tracking)
- View customer list
- Access dashboard statistics
- Manage inventory

## 📊 Admin Dashboard Features

- **Overview:** Recent orders, sales stats, pending shipments
- **Products:** Add/edit/delete products, manage variants, upload images
- **Orders:** View all orders, update status, add tracking numbers
- **Customers:** View customer list, order history
- **Inventory:** Track stock levels, low stock alerts

## 🔧 Customization

### Adding New Product Variants
1. Add variant fields to Product model
2. Update product controller to handle new fields
3. Update frontend ProductDetail page to display variants
4. Update cart logic to handle variant selection

### Adding New Payment Gateway
1. Install payment gateway SDK
2. Create payment controller in backend
3. Add payment routes
4. Update checkout flow in frontend
5. Update Order model with payment details

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Contact: admin@lafactoria.com

## 📄 License

This project is proprietary and confidential.

## 🙏 Acknowledgments

- Design inspired by WordPress Alukas theme
- Icons from various open-source libraries
- React community for excellent documentation

---

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Status:** Active Development
