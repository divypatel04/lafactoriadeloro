import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { wishlistService, cartService } from '../../services';
import useStore from '../../store/useStore';
import './Wishlist.css';

const Wishlist = () => {
  const { setCart } = useStore();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistService.getWishlist();
      setWishlist(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlist(wishlist.filter(item => item._id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      // Get default/first available options
      const selectedOptions = {
        composition: product.availableOptions?.compositions?.[0] || null,
        material: product.availableOptions?.materials?.[0] || null,
        ringSize: product.availableOptions?.ringSizes?.[0] || null,
        diamondType: product.availableOptions?.diamondTypes?.[0] || 'none'
      };

      const response = await cartService.addToCart({
        productId: product._id,
        quantity: 1,
        selectedOptions
      });
      
      setCart(response.data);
      toast.success('Added to cart! You can customize options in cart.');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  if (loading) {
    return <div className="wishlist-loading">Loading your wishlist...</div>;
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <h1>My Wishlist</h1>
        <p className="wishlist-count">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''}</p>

        {wishlist.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-icon">❤️</div>
            <p>Your wishlist is empty</p>
            <Link to="/shop" className="btn-shop">Start Shopping</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((product) => (
              <div key={product._id} className="wishlist-item">
                <button
                  className="remove-btn"
                  onClick={() => handleRemove(product._id)}
                  aria-label="Remove from wishlist"
                >
                  ×
                </button>
                
                <Link to={`/product/${product.slug}`} className="product-image">
                  <img
                    src={product.images?.[0]?.url || '/placeholder.jpg'}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                </Link>
                
                <div className="product-info">
                  <Link to={`/product/${product.slug}`} className="product-name">
                    {product.name}
                  </Link>
                  
                  <p className="product-category">{product.category?.name}</p>
                  
                  <div className="product-price">
                    <span className="customize-price-note">Customize ring to see price</span>
                  </div>
                  
                  <div className="product-details">
                    <span className="product-weight">
                      Weight: {product.weight || 'N/A'}g
                    </span>
                  </div>
                  
                  <button
                    className="btn-add-to-cart"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
