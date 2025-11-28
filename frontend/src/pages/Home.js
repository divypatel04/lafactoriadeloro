import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService, categoryService, wishlistService, uploadService } from '../services';
import useStore from '../store/useStore';
import HeroSlider from '../components/homepage/HeroSlider';
import { toast } from 'react-toastify';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState({});

  useEffect(() => {
    loadFeaturedProducts();
    loadCategories();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const response = await productService.getFeaturedProducts();
      setFeaturedProducts(response.data);
    } catch (error) {
      console.error('Error loading featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleAddToWishlist = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.info('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    setWishlistLoading(prev => ({ ...prev, [productId]: true }));
    
    try {
      await wishlistService.addToWishlist(productId);
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to wishlist');
    } finally {
      setWishlistLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <div className="home-page">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="categories-section pt-60 pb-60">
          <div className="container">
            <div className="section-title">
              <h2>Shop by Category</h2>
              <p>Explore our exquisite jewelry collections</p>
            </div>
            <div className="categories-grid">
              {categories.map(category => (
                <Link 
                  key={category._id} 
                  to={`/shop?category=${category._id}`}
                  className="category-card"
                >
                  <div className="category-icon">
                    {category.image ? (
                      <img src={uploadService.getImageUrl(category.image)} alt={category.name} />
                    ) : (
                      <span>{category.icon || '💍'}</span>
                    )}
                  </div>
                  <h3>{category.name}</h3>
                  <p>{category.description || 'Explore collection'}</p>
                </Link>
              ))}
              <Link 
                to="/custom-ring"
                className="category-card custom-ring-card"
              >
                <div className="category-icon">✨</div>
                <h3>Customize Your Own Ring</h3>
                <p>Create a unique piece designed just for you</p>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="featured-section pt-60 pb-80">
        <div className="container">
          <div className="section-title">
            <h2>Featured Collection</h2>
            <p>Discover our handpicked selection of stunning jewelry</p>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map(product => (
                <div key={product._id} className="product-card">
                  <Link to={`/product/${product.slug}`}>
                    <div className="product-image">
                      <button 
                        className="wishlist-btn" 
                        onClick={(e) => handleAddToWishlist(product._id, e)}
                        disabled={wishlistLoading[product._id]}
                        title="Add to Wishlist"
                      >
                        {wishlistLoading[product._id] ? '...' : '♡'}
                      </button>
                      <img 
                        src={uploadService.getImageUrl(product.images[0]?.url)} 
                        alt={product.name} 
                      />
                      {product.isNew && <span className="badge badge-new">New</span>}
                      {product.onSale && <span className="badge badge-sale">Sale</span>}
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-price">
                        {product.onSale && product.salePrice ? (
                          <>
                            <span className="price-sale">${product.salePrice?.toFixed(2)}</span>
                            <span className="price-original">${product.basePrice?.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="price">${product.basePrice?.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-40">
            <Link to="/shop" className="btn btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="about-preview-section pt-80 pb-80" style={{ background: '#f9f9f9' }}>
        <div className="container">
          <div className="about-preview-grid">
            <div className="about-image">
              <img 
                src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=800&fit=crop" 
                alt="La Factoria del Oro"
              />
            </div>
            <div className="about-content">
              <h2>About La Factoria del Oro</h2>
              <p className="about-subtitle">Crafting Excellence Since 1990</p>
              <p>
                We are dedicated to creating exquisite, handcrafted jewelry that celebrates life's most precious moments. 
                Each piece is meticulously designed and crafted by our master artisans using only the finest materials.
              </p>
              <p>
                From engagement rings to custom designs, we combine traditional craftsmanship with modern elegance 
                to create jewelry that tells your unique story.
              </p>
              <Link to="/about" className="btn btn-primary mt-20">Learn More About Us</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section pt-80 pb-80">
        <div className="container">
          <div className="section-title">
            <h2>What Our Customers Say</h2>
            <p>Real experiences from our valued customers</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "The engagement ring I purchased is absolutely stunning! The quality is exceptional and the 
                customer service was outstanding. Highly recommend!"
              </p>
              <p className="testimonial-author">- Sarah M.</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "Beautiful craftsmanship and attention to detail. My custom wedding band exceeded all expectations. 
                Thank you for making our special day even more memorable!"
              </p>
              <p className="testimonial-author">- Michael & Emma</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "I've purchased several pieces from La Factoria and each one is a masterpiece. The gold quality 
                is superb and the designs are timeless."
              </p>
              <p className="testimonial-author">- Jennifer K.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section pb-80" style={{ background: '#f9f9f9' }}>
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🚚</div>
              <h3>Free Shipping</h3>
              <p>On orders over $500</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💎</div>
              <h3>Quality Guaranteed</h3>
              <p>Certified authentic jewelry</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <h3>Secure Payment</h3>
              <p>100% secure transactions</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💬</div>
              <h3>24/7 Support</h3>
              <p>Dedicated customer service</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
