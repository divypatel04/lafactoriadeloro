# La Factoria Del Oro - Frontend

React-based e-commerce frontend for jewelry and ring sales.

## Features

- **Responsive Design** - Mobile-first approach matching WordPress theme
- **Product Browsing** - Advanced filtering by material, purity, price, category
- **User Authentication** - Register, login, password reset
- **Shopping Cart** - Add/remove items, update quantities
- **Wishlist** - Save favorite products
- **Checkout** - Multi-step checkout process
- **Customer Dashboard** - Order tracking, profile management, addresses
- **Admin Dashboard** - Product management, order management, statistics

## Tech Stack

- React 18
- React Router v6
- Zustand (State Management)
- Axios (HTTP Client)
- React Toastify (Notifications)
- React Slick (Carousels)

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.js
│   │   │   ├── Header.css
│   │   │   ├── Footer.js
│   │   │   └── Footer.css
│   │   ├── products/
│   │   │   ├── ProductCard.js
│   │   │   ├── ProductGrid.js
│   │   │   ├── ProductFilters.js
│   │   │   └── ProductGallery.js
│   │   ├── cart/
│   │   │   ├── CartItem.js
│   │   │   └── CartSummary.js
│   │   ├── common/
│   │   │   ├── Loading.js
│   │   │   ├── Modal.js
│   │   │   └── Pagination.js
│   │   ├── ProtectedRoute.js
│   │   └── AdminRoute.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Shop.js
│   │   ├── ProductDetail.js
│   │   ├── Cart.js
│   │   ├── Checkout.js
│   │   ├── auth/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── ForgotPassword.js
│   │   │   └── ResetPassword.js
│   │   ├── customer/
│   │   │   ├── Dashboard.js
│   │   │   ├── Orders.js
│   │   │   ├── OrderDetail.js
│   │   │   ├── Profile.js
│   │   │   ├── Addresses.js
│   │   │   └── Wishlist.js
│   │   └── admin/
│   │       ├── Dashboard.js
│   │       ├── Products.js
│   │       ├── Orders.js
│   │       └── Customers.js
│   ├── services/
│   │   ├── api.js
│   │   └── index.js
│   ├── store/
│   │   └── useStore.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your API URL:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SITE_NAME=La Factoria Del Oro
```

5. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

## Features Implementation

### Public Pages
- ✅ Home page with banner, featured products
- ✅ Shop page with filters and pagination
- ✅ Product detail page with variants, image gallery
- ✅ Shopping cart
- ✅ Authentication (Login/Register)

### Customer Features
- ✅ Customer dashboard
- ✅ Order history and tracking
- ✅ Profile management
- ✅ Address book
- ✅ Wishlist
- ✅ Checkout process

### Admin Features
- ✅ Admin dashboard with statistics
- ✅ Product management (CRUD)
- ✅ Order management
- ✅ Customer management
- ✅ Sales reports

## Design

The design closely matches the WordPress theme with:
- Jost font family
- Color scheme: Black (#222), White (#FFF), Gray (#777)
- Clean, modern layout
- Responsive design for all screen sizes
- Smooth transitions and hover effects

## State Management

Using Zustand for lightweight state management:
- User authentication state
- Shopping cart state
- Wishlist state
- Categories cache

## API Integration

All API calls are centralized in the `services` folder:
- `api.js` - Axios instance with interceptors
- `index.js` - Service functions for all endpoints

## Routing

React Router v6 for navigation:
- Public routes (Home, Shop, Product, Auth)
- Protected routes (Checkout, Account pages)
- Admin routes (Admin dashboard and management)

## Styling

- CSS Modules for component-specific styles
- Global styles in `index.css`
- Responsive design with mobile-first approach
- Matches WordPress theme colors and typography

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC
