import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { orderService, cartService, paymentService } from '../services';
import { toast } from 'react-toastify';
import useStore from '../store/useStore';
import { generateOrderReceipt } from '../utils/pdfGenerator';
import './OrderSuccess.css';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCart } = useStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    if (orderId) {
      // Check if returning from Stripe
      const sessionId = searchParams.get('session_id');
      if (sessionId) {
        // Verify the Stripe session and update order status
        verifyStripeSession(sessionId);
      } else {
        // Just load the order
        loadOrder();
      }
      
      // Clear pending order from session storage
      sessionStorage.removeItem('pendingOrderId');
    } else {
      // If no orderId in params, redirect to orders
      navigate('/account/orders');
    }
  }, [orderId, searchParams]);

  const verifyStripeSession = async (sessionId) => {
    try {
      // Verify payment with backend
      await paymentService.verifySession(sessionId, orderId);
      
      // Clear cart after successful Stripe payment
      await clearCartAfterPayment();
      
      setPaymentVerified(true);
      toast.success('✅ Payment successful! Your order has been confirmed.');
      
      // Load updated order
      await loadOrder();
    } catch (error) {
      console.error('Failed to verify payment:', error);
      toast.error('Payment verification failed. Please contact support.');
      loadOrder(); // Still load the order to show details
    }
  };

  const clearCartAfterPayment = async () => {
    try {
      await cartService.clearCart();
      setCart({ items: [], totalItems: 0, totalPrice: 0 });
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const loadOrder = async () => {
    try {
      const response = await orderService.getOrderById(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (order) {
      try {
        generateOrderReceipt(order);
        toast.success('Receipt downloaded successfully!');
      } catch (error) {
        console.error('Failed to generate receipt:', error);
        toast.error('Failed to download receipt. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="order-success-page">
        <div className="container">
          <div className="loading">Loading order details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-page">
      <div className="container pt-60 pb-80">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1>Order Placed Successfully!</h1>
          <p className="success-message">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          {order && (
            <div className="order-summary">
              <h2>Order Details</h2>
              <div className="order-info">
                <div className="info-row">
                  <span className="info-label">Order Number:</span>
                  <span className="info-value">{order.orderNumber}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Order Date:</span>
                  <span className="info-value">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Total Amount:</span>
                  <span className="info-value">${(order.pricing?.total || 0).toFixed(2)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Payment Status:</span>
                  <span className={`status-badge status-${order.paymentStatus}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Order Status:</span>
                  <span className={`status-badge status-${order.orderStatus || order.status}`}>
                    {order.orderStatus || order.status}
                  </span>
                </div>
              </div>

              <div className="order-items">
                <h3>Items Ordered ({order.items?.length || 0})</h3>
                {order.items?.map((item, index) => (
                  <div key={index} className="order-item">
                    <img 
                      src={item.product?.images?.[0]?.url || '/placeholder.jpg'} 
                      alt={item.product?.name || 'Product'}
                    />
                    <div className="item-details">
                      <h4>{item.product?.name || 'Product'}</h4>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ${(item.price || 0).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="success-actions">
            <button 
              onClick={handleDownloadReceipt} 
              className="btn btn-download"
              title="Download PDF Receipt"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download Receipt (PDF)
            </button>
            <Link to="/account/orders" className="btn btn-primary">
              View All Orders
            </Link>
            <Link to="/shop" className="btn btn-outline">
              Continue Shopping
            </Link>
          </div>

          <div className="order-notification">
            <p>📧 A confirmation email has been sent to your registered email address.</p>
            <p>📦 You can track your order status in <Link to="/account/orders">My Orders</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
