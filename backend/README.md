# La Factoria Del Oro - Backend API

E-commerce backend API built with Node.js, Express, and MongoDB for jewelry/ring sales.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Customer/Admin)
  - Password reset functionality
  
- **Product Management**
  - Product variants (material, purity, weight, pricing)
  - Advanced filtering and search
  - Category management
  - Image management
  
- **Order Management**
  - Order creation and tracking
  - Status updates with email notifications
  - Order history
  
- **Cart & Wishlist**
  - Shopping cart with variant selection
  - Wishlist functionality
  
- **Admin Dashboard**
  - Sales statistics
  - Order management
  - User management
  - Inventory tracking

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. Clone the repository and navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` file with your configuration:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lafactoria-ecommerce
JWT_SECRET=your_secret_key_here
# ... other settings
```

5. Start MongoDB service (if local)

6. Run the server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

### Seed Database (Optional)

To populate the database with sample data:
```bash
npm run seed
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `PUT /api/auth/update-password` - Update password
- `POST /api/auth/forgot-password` - Forgot password
- `PUT /api/auth/reset-password/:token` - Reset password

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/search?q=query` - Search products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:slug` - Get product by slug
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get category by slug
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemId` - Update cart item
- `DELETE /api/cart/remove/:itemId` - Remove from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders` - Get all orders (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `PUT /api/orders/:id/tracking` - Update tracking info (Admin)

### Wishlist
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist/add/:productId` - Add to wishlist
- `DELETE /api/wishlist/remove/:productId` - Remove from wishlist

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/address` - Add address
- `PUT /api/users/address/:addressId` - Update address
- `DELETE /api/users/address/:addressId` - Delete address

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/toggle-status` - Toggle user status
- `GET /api/admin/sales-report` - Get sales report

## Database Models

- **User** - User accounts with addresses and wishlist
- **Product** - Products with variants, pricing, and inventory
- **Category** - Product categories with hierarchy
- **Order** - Orders with items, pricing, and tracking
- **Cart** - Shopping cart for users

## Email Notifications

The system sends automated emails for:
- Welcome email on registration
- Order confirmation
- Order status updates
- Password reset

Configure email settings in `.env` file.

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- HTTP headers security with Helmet
- Rate limiting
- CORS configuration
- Input validation

## Project Structure

```
backend/
├── controllers/      # Request handlers
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── uploads/         # File uploads
├── .env.example     # Environment variables template
├── server.js        # Server entry point
└── package.json     # Dependencies
```

## License

ISC
