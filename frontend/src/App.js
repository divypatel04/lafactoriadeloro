import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CookieConsent from './components/CookieConsent';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Shipping from './pages/Shipping';
import Returns from './pages/Returns';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import CustomerDashboard from './pages/customer/Dashboard';
import Orders from './pages/customer/Orders';
import OrderDetail from './pages/customer/OrderDetail';
import Profile from './pages/customer/Profile';
import Addresses from './pages/customer/Addresses';
import Wishlist from './pages/customer/Wishlist';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import ProductForm from './pages/admin/ProductFormNew';
import AdminOrders from './pages/admin/Orders';
import AdminSliders from './pages/admin/AdminSliders';
import AdminCustomers from './pages/admin/Customers';
import PricingConfig from './pages/admin/PricingConfigNew';
import EmailSettings from './pages/admin/EmailSettings';
import Settings from './pages/admin/Settings';
import Coupons from './pages/admin/Coupons';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="App">
      {!isAdminRoute && <Header />}
      <main className={isAdminRoute ? '' : 'main-content'}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Customer Routes */}
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/order-success/:orderId" element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            } />
            <Route path="/account" element={
              <ProtectedRoute>
                <CustomerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/account/orders" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/account/orders/:id" element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            } />
            <Route path="/account/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/account/addresses" element={
              <ProtectedRoute>
                <Addresses />
              </ProtectedRoute>
            } />
            <Route path="/account/wishlist" element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/products" element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            } />
            <Route path="/admin/products/new" element={
              <AdminRoute>
                <ProductForm />
              </AdminRoute>
            } />
            <Route path="/admin/products/edit/:id" element={
              <AdminRoute>
                <ProductForm />
              </AdminRoute>
            } />
            <Route path="/admin/sliders" element={
              <AdminRoute>
                <AdminSliders />
              </AdminRoute>
            } />
            <Route path="/admin/orders" element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            } />
            <Route path="/admin/orders" element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            } />
            <Route path="/admin/customers" element={
              <AdminRoute>
                <AdminCustomers />
              </AdminRoute>
            } />
            <Route path="/admin/pricing" element={
              <AdminRoute>
                <PricingConfig />
              </AdminRoute>
            } />
            <Route path="/admin/email-settings" element={
              <AdminRoute>
                <EmailSettings />
              </AdminRoute>
            } />
            <Route path="/admin/settings" element={
              <AdminRoute>
                <Settings />
              </AdminRoute>
            } />
            <Route path="/admin/coupons" element={
              <AdminRoute>
                <Coupons />
              </AdminRoute>
            } />
          </Routes>
        </main>
        {!isAdminRoute && <Footer />}
        {!isAdminRoute && <CookieConsent />}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
