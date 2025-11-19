import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '../services';
import './OrderSuccess.css';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    } else {
      // If no orderId in params, redirect to orders
      navigate('/account/orders');
    }
  }, [orderId]);

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
