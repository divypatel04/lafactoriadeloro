import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { productService, cartService, wishlistService, reviewService } from '../services';
import useStore from '../store/useStore';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, setCart } = useStore();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({
    material: null,
    purity: null,
    ringSize: null,
    diamondType: null
  });
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState({});
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await productService.getProductBySlug(slug);
      setProduct(response.data);
      
      // Set initial calculated price to base price
      setCalculatedPrice(response.data.basePrice);
      
      // Set default options if available
      if (response.data.priceModifiers) {
        const defaultOptions = {};
        
        // Set first available material
        if (response.data.priceModifiers.materials?.length > 0) {
          const firstMaterial = response.data.priceModifiers.materials.find(m => m.available);
          if (firstMaterial) defaultOptions.material = firstMaterial.name;
        }
        
        // Set first available purity
        if (response.data.priceModifiers.purities?.length > 0) {
          const firstPurity = response.data.priceModifiers.purities.find(p => p.available);
          if (firstPurity) defaultOptions.purity = firstPurity.name;
        }
        
        // Set first available diamond type
        if (response.data.priceModifiers.diamondTypes?.length > 0) {
          const firstDiamond = response.data.priceModifiers.diamondTypes.find(d => d.available);
          if (firstDiamond) defaultOptions.diamondType = firstDiamond.name;
        }
        
        setSelectedOptions(prev => ({ ...prev, ...defaultOptions }));
      }
    } catch (error) {
      toast.error('Product not found');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Filter images based on selected material
  const filteredImages = React.useMemo(() => {
    if (!product || !product.images || product.images.length === 0) {
      return [];
    }

    // If no material is selected, show all images
    if (!selectedOptions.material) {
      return product.images;
    }

    // Filter images that match the selected material
    const materialImages = product.images.filter(
      img => img.material === selectedOptions.material
    );

    // If no material-specific images found, show all images as fallback
    return materialImages.length > 0 ? materialImages : product.images;
  }, [product, selectedOptions.material]);

  // Reset selected image index when material changes
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedOptions.material]);

  // Calculate price whenever options change
  useEffect(() => {
    if (!product) return;
    
    let finalPrice = product.basePrice || 0;
    
    // Add material price adjustment
    if (selectedOptions.material && product.priceModifiers?.materials) {
      const material = product.priceModifiers.materials.find(m => m.name === selectedOptions.material);
      if (material) {
        finalPrice += material.priceAdjustment || 0;
      }
    }
    
    // Add purity price adjustment
    if (selectedOptions.purity && product.priceModifiers?.purities) {
      const purity = product.priceModifiers.purities.find(p => p.name === selectedOptions.purity);
      if (purity) {
        finalPrice += purity.priceAdjustment || 0;
      }
    }
    
    // Add ring size price adjustment
    if (selectedOptions.ringSize && product.priceModifiers?.ringSizes) {
      const ringSize = product.priceModifiers.ringSizes.find(rs => rs.size === selectedOptions.ringSize);
      if (ringSize) {
        finalPrice += ringSize.priceAdjustment || 0;
      }
    }
    
    // Add diamond type price adjustment
    if (selectedOptions.diamondType && product.priceModifiers?.diamondTypes) {
      const diamondType = product.priceModifiers.diamondTypes.find(dt => dt.name === selectedOptions.diamondType);
      if (diamondType) {
        finalPrice += diamondType.priceAdjustment || 0;
      }
    }
    
    setCalculatedPrice(Math.max(0, finalPrice));
  }, [product, selectedOptions]);

  const handleOptionChange = (field, value) => {
    setSelectedOptions({ ...selectedOptions, [field]: value });
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.info('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (product.stock < quantity) {
      toast.error('Not enough stock available');
      return;
    }

    setAddingToCart(true);
    try {
      const response = await cartService.addToCart({
        productId: product._id,
        selectedOptions: selectedOptions,
        quantity,
        price: calculatedPrice
      });
      
      setCart(response.data);
      toast.success('Added to cart successfully!');
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async (productId = null, e = null) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!user) {
      toast.info('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    const targetProductId = productId || product._id;
    const isMainProduct = !productId;

    if (isMainProduct) {
      setAddingToWishlist(true);
    } else {
      setWishlistLoading(prev => ({ ...prev, [targetProductId]: true }));
    }

    try {
      await wishlistService.addToWishlist(targetProductId);
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to wishlist');
    } finally {
      if (isMainProduct) {
        setAddingToWishlist(false);
      } else {
        setWishlistLoading(prev => ({ ...prev, [targetProductId]: false }));
      }
    }
  };

  const getCurrentPrice = () => {
    return calculatedPrice.toFixed(2);
  };

  const getAvailableStock = () => {
    return product?.stock || 0;
  };

  // Get available options from price modifiers
  const getAvailableMaterials = () => {
    if (!product?.priceModifiers?.materials) return [];
    return product.priceModifiers.materials.filter(m => m.available);
  };

  const getAvailablePurities = () => {
    if (!product?.priceModifiers?.purities) return [];
    return product.priceModifiers.purities.filter(p => p.available);
  };

  const getAvailableRingSizes = () => {
    if (!product?.priceModifiers?.ringSizes) return [];
    return product.priceModifiers.ringSizes.filter(rs => rs.available);
  };

  const getAvailableDiamondTypes = () => {
    if (!product?.priceModifiers?.diamondTypes) return [];
    return product.priceModifiers.diamondTypes.filter(dt => dt.available);
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-section">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link> / 
            <Link to="/shop">Shop</Link> / 
            <span>{product.name}</span>
          </div>
        </div>
      </div>

      <div className="product-detail-content pt-40 pb-80">
        <div className="container">
          <div className="product-detail-grid">
            {/* Image Gallery */}
            <div className="product-gallery">
              <div className={`main-image ${isZoomed ? 'zoomed' : ''}`}>
                <img
                  src={filteredImages[selectedImage]?.url || '/placeholder.jpg'}
                  alt={product.name}
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                />
                {isZoomed && <div className="zoom-hint">Move mouse to zoom</div>}
                {selectedOptions.material && filteredImages.length > 0 && filteredImages[0].material && (
                  <div className="material-badge-overlay">
                    {selectedOptions.material.replace('-', ' ').toUpperCase()}
                  </div>
                )}
              </div>
              
              {filteredImages.length > 1 && (
                <div className="thumbnail-list">
                  {filteredImages.map((image, index) => (
                    <div
                      key={index}
                      className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img src={image.url} alt={`${product.name} ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-info-section">
              <h1 className="product-title">{product.name}</h1>
              
              <div className="product-price-section">
                <span className="product-price">${getCurrentPrice()}</span>
                {product.sku && (
                  <span className="product-sku">SKU: {product.sku}</span>
                )}
              </div>

              {product.shortDescription && (
                <div className="product-description">
                  <p>{product.shortDescription}</p>
                </div>
              )}

              {/* Option Selection */}
              {product.priceModifiers && (
                <div className="product-variants">
                  {/* Purity/Composition Selector */}
                  {getAvailablePurities().length > 0 && (
                    <div className="variant-option">
                      <label className="option-label">Composition:</label>
                      <select
                        value={selectedOptions.purity || ''}
                        onChange={(e) => handleOptionChange('purity', e.target.value)}
                        className="variant-select-dropdown"
                      >
                        <option value="">Choose an option</option>
                        {getAvailablePurities().map(purity => (
                          <option key={purity.name} value={purity.name}>
                            {purity.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Ring Size Selector */}
                  {getAvailableRingSizes().length > 0 && (
                    <div className="variant-option">
                      <label className="option-label">Ring Size:</label>
                      <select
                        value={selectedOptions.ringSize || ''}
                        onChange={(e) => handleOptionChange('ringSize', e.target.value)}
                        className="variant-select-dropdown"
                      >
                        <option value="">Choose an option</option>
                        {getAvailableRingSizes().map(size => (
                          <option key={size.size} value={size.size}>
                            Size {size.size}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Diamond Type Selector */}
                  {getAvailableDiamondTypes().length > 0 && (
                    <div className="variant-option">
                      <label className="option-label">Diamond Type:</label>
                      <select
                        value={selectedOptions.diamondType || ''}
                        onChange={(e) => handleOptionChange('diamondType', e.target.value)}
                        className="variant-select-dropdown"
                      >
                        <option value="">Choose an option</option>
                        {getAvailableDiamondTypes().map(type => (
                          <option key={type.name} value={type.name}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Color/Material Selector with Swatches */}
                  {getAvailableMaterials().length > 0 && (
                    <div className="variant-option">
                      <label className="option-label">Color:</label>
                      <div className="color-swatches">
                        {getAvailableMaterials().map(material => {
                          const colorMap = {
                            'rose-gold': '#E5C0A8',
                            'white-gold': '#E8E8E8',
                            'yellow-gold': '#FFD700',
                            'platinum': '#C0C0C0',
                            'silver': '#C0C0C0'
                          };
                          const isSelected = selectedOptions.material === material.name;
                          
                          return (
                            <div
                              key={material.name}
                              className={`color-swatch ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleOptionChange('material', material.name)}
                              title={material.label}
                            >
                              <div
                                className="swatch-circle"
                                style={{ backgroundColor: colorMap[material.name] || '#D4AF37' }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      {selectedOptions.material && (
                        <div className="selected-color-name">
                          {(() => {
                            const material = getAvailableMaterials().find(m => m.name === selectedOptions.material);
                            return material?.label;
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Clear Selection Link */}
                  <button
                    className="btn-clear-selection"
                    onClick={() => {
                      // Reset to first available options
                      const firstMaterial = getAvailableMaterials()[0];
                      const firstPurity = getAvailablePurities(firstMaterial?.name)[0];
                      const firstSize = getAvailableRingSizes(firstMaterial?.name, firstPurity?.name)[0];
                      const firstDiamond = getAvailableDiamondTypes(firstMaterial?.name, firstPurity?.name, firstSize?.size)[0];
                      
                      setSelectedOptions({
                        material: firstMaterial?.name || null,
                        purity: firstPurity?.name || null,
                        ringSize: firstSize?.size || null,
                        diamondType: firstDiamond?.name || null
                      });
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Stock Status */}
              <div className="stock-status">
                {getAvailableStock() > 0 ? (
                  <span className="in-stock">
                    ✓ In Stock ({getAvailableStock()} available)
                  </span>
                ) : (
                  <span className="out-of-stock">✗ Out of Stock</span>
                )}
              </div>

              {/* Quantity and Add to Cart */}
              <div className="product-actions">
                <div className="quantity-selector">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max={getAvailableStock()}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(getAvailableStock(), quantity + 1))}
                    disabled={quantity >= getAvailableStock()}
                  >
                    +
                  </button>
                </div>

                <button
                  className="btn btn-add-to-cart"
                  onClick={handleAddToCart}
                  disabled={addingToCart || getAvailableStock() === 0}
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>

                <button
                  className="btn btn-wishlist"
                  onClick={() => handleAddToWishlist()}
                  disabled={addingToWishlist}
                  title="Add to Wishlist"
                >
                  ♡
                </button>
              </div>

              {/* Product Specifications */}
              {product.specifications && product.specifications.length > 0 && (
                <div className="product-specifications">
                  <h3>Specifications</h3>
                  <table>
                    <tbody>
                      {product.specifications.map((spec, index) => (
                        <tr key={index}>
                          <td className="spec-key">{spec.key}:</td>
                          <td className="spec-value">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Additional Info */}
              <div className="product-meta">
                <p>
                  <strong>Category:</strong>{' '}
                  {product.category?.name || 'Uncategorized'}
                </p>
                {product.weight && (
                  <p><strong>Weight:</strong> {product.weight}g</p>
                )}
                {selectedOptions.material && (
                  <p><strong>Material:</strong> {getAvailableMaterials().find(m => m.name === selectedOptions.material)?.label || selectedOptions.material}</p>
                )}
                {selectedOptions.purity && (
                  <p><strong>Purity:</strong> {getAvailablePurities().find(p => p.name === selectedOptions.purity)?.label || selectedOptions.purity}</p>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="reviews-section mt-80">
            <h2 className="section-title">Customer Reviews</h2>
            
            <div className="reviews-summary">
              <div className="rating-overview">
                <div className="average-rating">
                  <span className="rating-number">{product.averageRating?.toFixed(1) || '0.0'}</span>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${star <= Math.round(product.averageRating || 0) ? 'filled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="review-count">{product.numReviews || 0} reviews</p>
                </div>
              </div>

              {user ? (
                <button className="btn btn-write-review" onClick={() => {
                  // Scroll to review form
                  document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  Write a Review
                </button>
              ) : (
                <p className="login-prompt">
                  <Link to="/login">Login</Link> to write a review
                </p>
              )}
            </div>

            {/* Review List */}
            <div className="reviews-list">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((review) => (
                  <div key={review._id} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <span className="reviewer-name">{review.user?.firstName || 'Anonymous'}</span>
                        <div className="review-rating">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`star ${star <= review.rating ? 'filled' : ''}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                    {review.verifiedPurchase && (
                      <span className="verified-badge">✓ Verified Purchase</span>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
              )}
            </div>

            {/* Review Form */}
            {user && (
              <div id="review-form" className="review-form-section">
                <h3>Write Your Review</h3>
                <form className="review-form" onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const rating = parseInt(formData.get('rating'));
                  const comment = formData.get('comment');
                  
                  if (!rating || rating < 1 || rating > 5) {
                    toast.error('Please select a rating');
                    return;
                  }
                  
                  if (!comment || comment.trim().length < 10) {
                    toast.error('Please write at least 10 characters');
                    return;
                  }

                  // Submit review via API
                  try {
                    await reviewService.submitReview(product._id, {
                      rating: parseInt(rating),
                      comment: comment.trim()
                    });
                    toast.success('Thank you for your review! It will be published after moderation.');
                    e.target.reset();
                    // Reload product to get updated reviews
                    loadProduct();
                  } catch (error) {
                    toast.error(error.message || 'Failed to submit review. Please try again.');
                  }
                }}>
                  <div className="form-group">
                    <label>Rating *</label>
                    <div className="rating-input">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <label key={star} className="star-label">
                          <input
                            type="radio"
                            name="rating"
                            value={star}
                            required
                          />
                          <span className="star">★</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Your Review *</label>
                    <textarea
                      name="comment"
                      rows="5"
                      placeholder="Share your experience with this product..."
                      required
                      minLength="10"
                    />
                  </div>

                  <button type="submit" className="btn btn-submit-review">
                    Submit Review
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Related Products */}
          {product.relatedProducts && product.relatedProducts.length > 0 && (
            <div className="related-products-section mt-80">
              <h2 className="section-title">Related Products</h2>
              <div className="products-grid">
                {product.relatedProducts.map(relatedProduct => (
                  <div key={relatedProduct._id} className="product-card">
                    <Link to={`/product/${relatedProduct.slug}`}>
                      <div className="product-image">
                        <button 
                          className="wishlist-btn" 
                          onClick={(e) => handleAddToWishlist(relatedProduct._id, e)}
                          disabled={wishlistLoading[relatedProduct._id]}
                          title="Add to Wishlist"
                        >
                          {wishlistLoading[relatedProduct._id] ? '...' : '♡'}
                        </button>
                        <img
                          src={relatedProduct.images[0]?.url || '/placeholder.jpg'}
                          alt={relatedProduct.name}
                        />
                      </div>
                      <div className="product-info">
                        <h3 className="product-name">{relatedProduct.name}</h3>
                        <div className="product-price">
                          <span className="price">${relatedProduct.basePrice}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
