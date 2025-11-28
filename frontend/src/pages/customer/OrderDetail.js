import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { orderService, uploadService } from '../../services';
import { generateOrderReceipt } from '../../utils/pdfGenerator';
import './OrderDetail.css';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderById(id);
      console.log('Order detail response:', response);
      setOrder(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled',
      paid: 'status-processing',
    };
    return statusClasses[status] || 'status-pending';
  };

  const getStatusSteps = (currentStatus) => {
    const steps = [
      { status: 'pending', label: 'Order Placed', icon: '✓' },
      { status: 'processing', label: 'Processing', icon: '⚙' },
      { status: 'shipped', label: 'Shipped', icon: '🚚' },
      { status: 'delivered', label: 'Delivered', icon: '📦' },
    ];

    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
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
    return <div className="order-detail-loading">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="order-not-found">
        <p>Order not found</p>
        <Link to="/account/orders" className="btn-back">Back to Orders</Link>
      </div>
    );
  }

  const statusSteps = getStatusSteps(order.orderStatus || order.status);

  return (
    <div className="order-detail-page">
      <div className="order-detail-container">
        <div className="order-detail-header">
          <Link to="/account/orders" className="back-link">← Back to Orders</Link>
          <div className="order-title-section">
            <div className="title-wrapper">
              <h1>Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}</h1>
              <span className={`order-status ${getStatusClass(order.orderStatus || order.status)}`}>
                {order.orderStatus || order.status}
              </span>
            </div>
            <button 
              onClick={handleDownloadReceipt} 
              className="btn-download-receipt"
              title="Download PDF Receipt"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
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
              Download Receipt
            </button>
          </div>
          <p className="order-date">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Order Status Timeline */}
        {(order.orderStatus || order.status) !== 'cancelled' && (
          <div className="order-timeline">
            <div className="timeline-steps">
              {statusSteps.map((step, index) => (
                <div key={step.status} className={`timeline-step ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}>
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-label">{step.label}</div>
                  {index < statusSteps.length - 1 && <div className="step-line"></div>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="order-detail-content">
          {/* Order Items */}
          <div className="order-items-section">
            <h2>Order Items</h2>
            <div className="order-items-list">
              {order.items?.map((item, index) => (
                <div key={index} className="order-item">
                  <img
                    src={uploadService.getImageUrl(item.product?.images?.[0]?.url || item.product?.images?.[0])}
                    alt={item.product?.name || 'Product'}
                    onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                  />
                  <div className="item-details">
                    <Link to={`/product/${item.product?.slug}`} className="item-name">
                      {item.product?.name || 'Product'}
                    </Link>
                    {item.variant && (
                      <p className="item-variant">
                        Material: {item.variant.material} | Purity: {item.variant.purity} | Weight: {item.variant.weight}g
                      </p>
                    )}
                    {item.variant?.sku && <p className="item-sku">SKU: {item.variant.sku}</p>}
                    <p className="item-quantity">Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    ${item.price?.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary & Addresses */}
          <div className="order-sidebar">
            {/* Order Summary */}
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${(order.pricing?.subtotal || order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>{(order.pricing?.shipping || order.shippingCost) === 0 ? 'FREE' : `$${(order.pricing?.shipping || order.shippingCost || 0).toFixed(2)}`}</span>
              </div>
              <div className="summary-row">
                <span>Tax:</span>
                <span>${(order.pricing?.tax || order.tax || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${(order.pricing?.total || order.totalPrice || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="address-card">
              <h3>Shipping Address</h3>
              <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
              <p>{order.shippingAddress?.addressLine1 || order.shippingAddress?.street}</p>
              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
              <p>{order.shippingAddress?.country}</p>
              {order.shippingAddress?.phone && <p>Phone: {order.shippingAddress.phone}</p>}
            </div>

            {/* Billing Address */}
            <div className="address-card">
              <h3>Billing Address</h3>
              <p>{order.billingAddress?.firstName} {order.billingAddress?.lastName}</p>
              <p>{order.billingAddress?.addressLine1 || order.billingAddress?.street}</p>
              {order.billingAddress?.addressLine2 && <p>{order.billingAddress.addressLine2}</p>}
              <p>{order.billingAddress?.city}, {order.billingAddress?.state} {order.billingAddress?.zipCode}</p>
              <p>{order.billingAddress?.country}</p>
            </div>

            {/* Payment Method */}
            <div className="payment-card">
              <h3>Payment Method</h3>
              <p>{order.paymentInfo?.method === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}</p>
              <p className="payment-status">
                {(order.paymentStatus === 'paid' || order.isPaid) ? '✓ Paid' : 'Payment Pending'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
