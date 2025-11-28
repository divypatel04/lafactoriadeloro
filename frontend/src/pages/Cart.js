import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useStore from '../store/useStore';
import { cartService, uploadService } from '../services';
import './Cart.css';

export default function Cart() {
  const navigate = useNavigate();
  const { user, cart, setCart } = useStore();
  const [loading, setLoading] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(null);

  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user]);

  const loadCart = async () => {
    try {
      const response = await cartService.getCart();
      setCart(response.data);
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdatingItem(itemId);
    try {
      console.log('Updating cart item:', itemId, 'to quantity:', newQuantity);
      const response = await cartService.updateCartItem(itemId, newQuantity);
      console.log('Cart update response:', response);
      setCart(response.data);
      toast.success('Cart updated');
    } catch (error) {
      console.error('Cart update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update cart');
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Remove this item from cart?')) return;

    setUpdatingItem(itemId);
    try {
      const response = await cartService.removeCartItem(itemId);
      setCart(response.data);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Clear all items from cart?')) return;

    setLoading(true);
    try {
      await cartService.clearCart();
      setCart({ items: [], totalItems: 0, totalPrice: 0 });
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="cart-page pt-60 pb-80">
        <div className="container">
          <div className="empty-cart">
            <h2>Please Login</h2>
            <p>You need to be logged in to view your cart</p>
            <Link to="/login" className="btn">
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="cart-page pt-60 pb-80">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your Cart is Empty</h2>
            <p>Add some products to get started</p>
            <Link to="/shop" className="btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="page-header">
        <div className="container">
          <h1>Shopping Cart</h1>
          <p className="cart-count">{cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      <div className="cart-content pt-60 pb-80">
        <div className="container">
          <div className="cart-layout">
            {/* Cart Items */}
            <div className="cart-items">
              <div className="cart-header">
                <h3>Cart Items</h3>
                <button 
                  className="btn-clear-cart"
                  onClick={handleClearCart}
                  disabled={loading}
                >
                  Clear Cart
                </button>
              </div>

              <div className="cart-items-list">
                {cart.items.map((item) => (
                  <div key={item._id} className="cart-item">
                    <Link to={`/product/${item.product.slug}`} className="item-image">
                      <img
                        src={uploadService.getImageUrl(item.product.images[0]?.url)}
                        alt={item.product.name}
                      />
                    </Link>

                    <div className="item-details">
                      <Link to={`/product/${item.product.slug}`}>
                        <h3 className="item-name">{item.product.name}</h3>
                      </Link>
                      
                      <div className="item-variant">
                        {item.selectedOptions?.material && <span>Material: {item.selectedOptions.material}</span>}
                        {item.selectedOptions?.purity && <span>Purity: {item.selectedOptions.purity}</span>}
                        {item.selectedOptions?.ringSize && <span>Size: {item.selectedOptions.ringSize}</span>}
                        {item.selectedOptions?.diamondType && <span>Diamond: {item.selectedOptions.diamondType}</span>}
                      </div>

                      <div className="item-sku">SKU: {item.product?.sku || 'N/A'}</div>
                    </div>

                    <div className="item-price">
                      <span className="price-label">Price</span>
                      <span className="price">${item.price?.toFixed(2)}</span>
                    </div>

                    <div className="item-quantity">
                      <span className="quantity-label">Quantity</span>
                      <div className="quantity-selector">
                        <button
                          onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updatingItem === item._id}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 1;
                            handleUpdateQuantity(item._id, newQty);
                          }}
                          min="1"
                          max={item.product?.stock || 999}
                          disabled={updatingItem === item._id}
                        />
                        <button
                          onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                          disabled={item.quantity >= (item.product?.stock || 999) || updatingItem === item._id}
                        >
                          +
                        </button>
                      </div>
                      {item.product?.stock < 10 && (
                        <span className="stock-warning">
                          Only {item.product.stock} left!
                        </span>
                      )}
                    </div>

                    <div className="item-subtotal">
                      <span className="subtotal-label">Subtotal</span>
                      <span className="subtotal">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>

                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveItem(item._id)}
                      disabled={updatingItem === item._id}
                      title="Remove item"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-actions-bottom">
                <Link to="/shop" className="btn btn-outline">
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="cart-summary">
              <h3>Order Summary</h3>
              
              <div className="summary-row">
                <span>Subtotal ({cart.totalItems} items):</span>
                <span className="summary-value">${cart.totalPrice?.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping:</span>
                <span className="summary-value">
                  {cart.totalPrice >= 500 ? 'FREE' : 'Calculated at checkout'}
                </span>
              </div>

              <div className="summary-row">
                <span>Tax:</span>
                <span className="summary-value">Calculated at checkout</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row summary-total">
                <span>Total:</span>
                <span className="summary-value">${cart.totalPrice?.toFixed(2)}</span>
              </div>

              {cart.totalPrice >= 500 && (
                <div className="free-shipping-notice">
                  🎉 You qualify for FREE shipping!
                </div>
              )}

              {cart.totalPrice < 500 && (
                <div className="shipping-threshold">
                  Add ${(500 - cart.totalPrice).toFixed(2)} more for FREE shipping
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(cart.totalPrice / 500) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                className="btn btn-checkout btn-block"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </button>

              <div className="payment-badges">
                <span>We accept:</span>
                <div className="badges">
                  <span>💳 Visa</span>
                  <span>💳 Mastercard</span>
                  <span>💳 AmEx</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
