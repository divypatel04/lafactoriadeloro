import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useStore from '../store/useStore';
import { orderService, cartService, couponService, paymentService } from '../services';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, cart, setCart } = useStore();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'cod'
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });

  const [billingAddress, setBillingAddress] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });

  const [useSameAddress, setUseSameAddress] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    // Check if payment was canceled
    const canceled = searchParams.get('canceled');
    if (canceled === 'true') {
      toast.error('Payment was canceled. Please try again or choose a different payment method.');
    }

    if (!user) {
      toast.info('Please login to checkout');
      navigate('/login');
      return;
    }

    if (!cart?.items || cart.items.length === 0) {
      toast.info('Your cart is empty');
      navigate('/cart');
      return;
    }

    loadCart();
  }, [user, searchParams]);

  const loadCart = async () => {
    try {
      const response = await cartService.getCart();
      setCart(response.data);
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const handleShippingChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handleBillingChange = (e) => {
    setBillingAddress({
      ...billingAddress,
      [e.target.name]: e.target.value
    });
  };

  const validateAddress = (address) => {
    const required = ['firstName', 'lastName', 'street', 'city', 'state', 'zipCode', 'country'];
    for (let field of required) {
      if (!address[field]) {
        toast.error(`Please fill in ${field}`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateAddress(shippingAddress)) return;
      if (!shippingAddress.email || !shippingAddress.phone) {
        toast.error('Please provide email and phone number');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!useSameAddress && !validateAddress(billingAddress)) return;
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    
    if (!code) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      setValidatingCoupon(true);
      
      // Call backend API to validate coupon
      const cartTotal = cart?.totalPrice || 0;
      const userId = user?._id || null;
      const cartItems = cart?.items?.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      })) || [];
      
      const response = await couponService.validateCoupon(code, cartTotal, userId, cartItems);
      
      if (response.success && response.data) {
        const couponData = {
          code: response.data.code,
          type: response.data.type,
          value: response.data.value,
          discount: response.data.discount || 0
        };
        
        setAppliedCoupon(couponData);
        setCouponCode('');
        
        if (couponData.type === 'free_shipping') {
          toast.success(`✅ Coupon "${code}" applied! Free shipping activated`);
        } else {
          toast.success(`✅ Coupon "${code}" applied! You saved $${couponData.discount.toFixed(2)}`);
        }
      } else {
        toast.error('❌ Invalid or expired coupon code');
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      toast.error(error.message || '❌ Invalid or expired coupon code');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info('Coupon removed');
  };

  const calculateShipping = () => {
    if (appliedCoupon?.type === 'free_shipping') {
      return 0;
    }
    return cart.totalPrice >= 500 ? 0 : 25;
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    const subtotal = cart?.totalPrice || 0;
    
    if (appliedCoupon.type === 'percentage') {
      return (subtotal * (appliedCoupon.value / 100)).toFixed(2);
    } else if (appliedCoupon.type === 'fixed') {
      return Math.min(appliedCoupon.value, subtotal).toFixed(2);
    }
    
    return 0;
  };

  const calculateTax = () => {
    const subtotal = cart?.totalPrice || 0;
    const shipping = calculateShipping();
    const discount = parseFloat(calculateDiscount());
    return ((subtotal + shipping - discount) * 0.08).toFixed(2);
  };

  const calculateTotal = () => {
    const shipping = calculateShipping();
    const tax = parseFloat(calculateTax());
    const discount = parseFloat(calculateDiscount());
    return (cart.totalPrice + shipping + tax - discount).toFixed(2);
  };

  const handlePlaceOrder = async () => {
    if (!agreedToTerms) {
      toast.error('Please agree to terms and conditions');
      return;
    }

    setLoading(true);
    setProcessingPayment(true);

    try {
      // Transform address format to match backend expectations
      const transformAddress = (addr) => ({
        firstName: addr.firstName,
        lastName: addr.lastName,
        addressLine1: addr.street,
        addressLine2: addr.addressLine2 || '',
        city: addr.city,
        state: addr.state,
        zipCode: addr.zipCode,
        country: addr.country,
        phone: addr.phone || shippingAddress.phone
      });

      const orderData = {
        items: cart.items.map(item => ({
          product: item.product._id,
          selectedOptions: item.selectedOptions || {},
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: transformAddress(shippingAddress),
        billingAddress: useSameAddress ? transformAddress(shippingAddress) : transformAddress(billingAddress),
        couponCode: appliedCoupon?.code || null,
        paymentMethod: paymentMethod // Add payment method to order data
      };

      // Handle payment based on method
      if (paymentMethod === 'card') {
        // Create order first (without clearing cart yet)
        const orderResponse = await orderService.createOrder(orderData);
        const order = orderResponse.data;

        // Create Stripe Checkout Session and redirect
        const totalAmount = parseFloat(calculateTotal());
        
        try {
          toast.info('Redirecting to secure payment...');
          
          const sessionResponse = await paymentService.createCheckoutSession(
            order._id,
            totalAmount,
            'usd'
          );

          // Store order ID in session storage for later retrieval
          sessionStorage.setItem('pendingOrderId', order._id);
          
          // Redirect to Stripe Checkout
          window.location.href = sessionResponse.data.url;
          
          // Don't set loading to false or clear cart yet
          // User will be redirected to Stripe
          return;
        } catch (paymentError) {
          console.error('Payment error:', paymentError);
          toast.error('Failed to initiate payment. Please try again or use Cash on Delivery.');
          setLoading(false);
          setProcessingPayment(false);
          return;
        }
      } else {
        // Cash on Delivery - create order and complete immediately
        const orderResponse = await orderService.createOrder(orderData);
        const order = orderResponse.data;
        
        toast.success('Order placed with Cash on Delivery!');
        
        // Clear cart
        await cartService.clearCart();
        setCart({ items: [], totalItems: 0, totalPrice: 0 });
        
        // Navigate to success page with order ID
        navigate(`/order-success/${order._id}`);
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
      setProcessingPayment(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="page-header">
        <div className="container">
          <h1>Checkout</h1>
          <div className="checkout-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Shipping</span>
            </div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Billing</span>
            </div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Payment</span>
            </div>
            <div className={`step ${step >= 4 ? 'active' : ''}`}>
              <span className="step-number">4</span>
              <span className="step-label">Review</span>
            </div>
          </div>
        </div>
      </div>

      <div className="checkout-content pt-60 pb-80">
        <div className="container">
          <div className="checkout-layout">
            {/* Main Content */}
            <div className="checkout-main">
              {/* Step 1: Shipping Address */}
              {step === 1 && (
                <div className="checkout-step">
                  <h2>Shipping Address</h2>
                  <form className="address-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">First Name *</label>
                        <input
                          type="text"
                          name="firstName"
                          className="form-control"
                          value={shippingAddress.firstName}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          className="form-control"
                          value={shippingAddress.lastName}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          value={shippingAddress.email}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone *</label>
                        <input
                          type="tel"
                          name="phone"
                          className="form-control"
                          value={shippingAddress.phone}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Street Address *</label>
                      <input
                        type="text"
                        name="street"
                        className="form-control"
                        value={shippingAddress.street}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">City *</label>
                        <input
                          type="text"
                          name="city"
                          className="form-control"
                          value={shippingAddress.city}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">State *</label>
                        <input
                          type="text"
                          name="state"
                          className="form-control"
                          value={shippingAddress.state}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">ZIP Code *</label>
                        <input
                          type="text"
                          name="zipCode"
                          className="form-control"
                          value={shippingAddress.zipCode}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Country *</label>
                        <select
                          name="country"
                          className="form-control"
                          value={shippingAddress.country}
                          onChange={handleShippingChange}
                          required
                        >
                          <option value="USA">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="UK">United Kingdom</option>
                        </select>
                      </div>
                    </div>
                  </form>

                  <div className="step-actions">
                    <button className="btn" onClick={handleNext}>
                      Continue to Billing
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Billing Address */}
              {step === 2 && (
                <div className="checkout-step">
                  <h2>Billing Address</h2>
                  
                  <div className="same-address-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={useSameAddress}
                        onChange={(e) => setUseSameAddress(e.target.checked)}
                      />
                      Same as shipping address
                    </label>
                  </div>

                  {!useSameAddress && (
                    <form className="address-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">First Name *</label>
                          <input
                            type="text"
                            name="firstName"
                            className="form-control"
                            value={billingAddress.firstName}
                            onChange={handleBillingChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Last Name *</label>
                          <input
                            type="text"
                            name="lastName"
                            className="form-control"
                            value={billingAddress.lastName}
                            onChange={handleBillingChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Street Address *</label>
                        <input
                          type="text"
                          name="street"
                          className="form-control"
                          value={billingAddress.street}
                          onChange={handleBillingChange}
                          required
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">City *</label>
                          <input
                            type="text"
                            name="city"
                            className="form-control"
                            value={billingAddress.city}
                            onChange={handleBillingChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">State *</label>
                          <input
                            type="text"
                            name="state"
                            className="form-control"
                            value={billingAddress.state}
                            onChange={handleBillingChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">ZIP Code *</label>
                          <input
                            type="text"
                            name="zipCode"
                            className="form-control"
                            value={billingAddress.zipCode}
                            onChange={handleBillingChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Country *</label>
                          <select
                            name="country"
                            className="form-control"
                            value={billingAddress.country}
                            onChange={handleBillingChange}
                            required
                          >
                            <option value="USA">United States</option>
                            <option value="Canada">Canada</option>
                            <option value="UK">United Kingdom</option>
                          </select>
                        </div>
                      </div>
                    </form>
                  )}

                  <div className="step-actions">
                    <button className="btn btn-outline" onClick={handleBack}>
                      Back
                    </button>
                    <button className="btn" onClick={handleNext}>
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Method */}
              {step === 3 && (
                <div className="checkout-step">
                  <h2>Payment Method</h2>
                  
                  <div className="payment-methods">
                    <div 
                      className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="payment-option-content">
                        <div className="payment-icon">💳</div>
                        <div className="payment-details">
                          <h4>Credit / Debit Card</h4>
                          <p>Pay securely with Stripe</p>
                          <div className="card-brands">
                            <span>Visa</span>
                            <span>Mastercard</span>
                            <span>Amex</span>
                            <span>Discover</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="payment-option-content">
                        <div className="payment-icon">💵</div>
                        <div className="payment-details">
                          <h4>Cash on Delivery</h4>
                          <p>Pay when you receive your order</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="payment-info-box">
                      <p><strong>🔒 Secure Payment</strong></p>
                      <p>Your payment information is encrypted and secure. You'll be redirected to complete your payment after reviewing your order.</p>
                    </div>
                  )}

                  {paymentMethod === 'cod' && (
                    <div className="payment-info-box cod-info">
                      <p><strong>💵 Cash on Delivery</strong></p>
                      <p>You can pay in cash when your order is delivered to your doorstep. Please keep the exact amount ready.</p>
                    </div>
                  )}

                  <div className="step-actions">
                    <button className="btn btn-outline" onClick={handleBack}>
                      Back
                    </button>
                    <button className="btn" onClick={handleNext}>
                      Review Order
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Order Review */}
              {step === 4 && (
                <div className="checkout-step">
                  <h2>Review Your Order</h2>

                  <div className="review-section">
                    <h3>Shipping Address</h3>
                    <div className="address-display">
                      <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                      <p>{shippingAddress.street}</p>
                      <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                      <p>{shippingAddress.country}</p>
                      <p>Email: {shippingAddress.email}</p>
                      <p>Phone: {shippingAddress.phone}</p>
                    </div>
                  </div>

                  <div className="review-section">
                    <h3>Payment Method</h3>
                    <div className="address-display">
                      {paymentMethod === 'card' ? (
                        <p>💳 <strong>Credit/Debit Card</strong> (via Stripe)</p>
                      ) : (
                        <p>💵 <strong>Cash on Delivery</strong></p>
                      )}
                    </div>
                  </div>

                  <div className="review-section">
                    <h3>Order Items</h3>
                    <div className="order-items">
                      {cart.items.map((item) => (
                        <div key={item._id} className="order-item">
                          <img src={item.product.images[0]?.url} alt={item.product.name} />
                          <div className="item-info">
                            <h4>{item.product.name}</h4>
                            <p className="item-variant">
                              {item.selectedOptions?.material && <span>Material: {item.selectedOptions.material}</span>}
                              {item.selectedOptions?.purity && <span> • Purity: {item.selectedOptions.purity}</span>}
                              {item.selectedOptions?.ringSize && <span> • Size: {item.selectedOptions.ringSize}</span>}
                              {item.selectedOptions?.diamondType && item.selectedOptions.diamondType !== 'none' && <span> • Diamond: {item.selectedOptions.diamondType}</span>}
                            </p>
                            <p className="item-quantity">Quantity: {item.quantity}</p>
                          </div>
                          <div className="item-price">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="terms-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                      />
                      I agree to the <a href="/terms">Terms & Conditions</a>
                    </label>
                  </div>

                  <div className="step-actions">
                    <button className="btn btn-outline" onClick={handleBack}>
                      Back
                    </button>
                    <button
                      className="btn btn-place-order"
                      onClick={handlePlaceOrder}
                      disabled={loading || !agreedToTerms}
                    >
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="checkout-sidebar">
              <div className="order-summary">
                <h3>Order Summary</h3>

                <div className="summary-items">
                  {cart?.items?.map((item) => (
                    <div key={item._id} className="summary-item">
                      <span className="item-name">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="summary-totals">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>${cart?.totalPrice?.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="summary-row discount-row">
                      <span>Discount ({appliedCoupon.code}):</span>
                      <span className="discount-amount">-${calculateDiscount()}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span>{calculateShipping() === 0 ? 'FREE' : `$${calculateShipping()}`}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax (8%):</span>
                    <span>${calculateTax()}</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row summary-total">
                    <span>Total:</span>
                    <span>${calculateTotal()}</span>
                  </div>
                </div>

                {calculateShipping() === 0 && (
                  <div className="free-shipping-badge">
                    🎉 FREE SHIPPING
                  </div>
                )}
              </div>

              {/* Coupon Code Section */}
              <div className="coupon-section">
                <h4>Have a Coupon Code?</h4>
                
                {!appliedCoupon ? (
                  <form className="coupon-form" onSubmit={handleApplyCoupon}>
                    <div className="coupon-input-group">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="coupon-input"
                        disabled={validatingCoupon}
                      />
                      <button 
                        type="submit" 
                        className="btn-apply-coupon"
                        disabled={validatingCoupon || !couponCode.trim()}
                      >
                        {validatingCoupon ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                    <p className="coupon-hint">💡 Enter your code and click Apply</p>
                  </form>
                ) : (
                  <div className="applied-coupon">
                    <div className="coupon-info">
                      <span className="coupon-code">{appliedCoupon.code}</span>
                      <span className="coupon-discount">-${calculateDiscount()}</span>
                    </div>
                    <button className="btn-remove-coupon" onClick={handleRemoveCoupon}>
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
