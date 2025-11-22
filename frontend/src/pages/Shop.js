import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { productService, categoryService, wishlistService } from '../services';
import { toast } from 'react-toastify';
import useStore from '../store/useStore';
import './Shop.css';

export default function Shop() {
  const navigate = useNavigate();
  const { user, wishlist, setWishlist } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [wishlistLoading, setWishlistLoading] = useState({});
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    material: searchParams.get('material') || '',
    purity: searchParams.get('purity') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minWeight: searchParams.get('minWeight') || '',
    maxWeight: searchParams.get('maxWeight') || '',
    inStock: searchParams.get('inStock') || '',
    sort: searchParams.get('sort') || 'createdAt',
    page: searchParams.get('page') || 1
  });

  const [showFilters, setShowFilters] = useState(false);

  const materials = ['Gold', 'Silver', 'Platinum', 'Diamond', 'Rose Gold', 'White Gold'];
  const purities = ['10K', '12K', '14K', '18K', '22K', '24K', '925', '950'];
  const sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: '-createdAt', label: 'Oldest First' },
    { value: 'basePrice', label: 'Price: Low to High' },
    { value: '-basePrice', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' },
    { value: '-name', label: 'Name: Z to A' }
  ];

  useEffect(() => {
    loadCategories();
    loadWishlist();
  }, []);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const queryParams = {};
      
      if (filters.search) queryParams.search = filters.search;
      if (filters.category) queryParams.category = filters.category;
      if (filters.material) queryParams.material = filters.material;
      if (filters.purity) queryParams.purity = filters.purity;
      if (filters.minPrice) queryParams.minPrice = filters.minPrice;
      if (filters.maxPrice) queryParams.maxPrice = filters.maxPrice;
      if (filters.minWeight) queryParams.minWeight = filters.minWeight;
      if (filters.maxWeight) queryParams.maxWeight = filters.maxWeight;
      if (filters.inStock) queryParams.inStock = filters.inStock;
      if (filters.sort) queryParams.sort = filters.sort;
      queryParams.page = filters.page;
      queryParams.limit = 12;

      const response = await productService.getAllProducts(queryParams);
      setProducts(response.data);
      
      // Map backend pagination fields to frontend expected fields
      const paginationData = response.pagination || {};
      setPagination({
        page: paginationData.currentPage || 1,
        pages: paginationData.totalPages || 1,
        total: paginationData.totalProducts || 0,
        limit: paginationData.limit || 12
      });
      
      // Update URL with filters
      setSearchParams(queryParams);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value,
      page: 1 // Reset to first page on filter change
    };
    setFilters(newFilters);
  };

  const loadWishlist = async () => {
    if (!user) return;
    try {
      const response = await wishlistService.getWishlist();
      setWishlist(response.data || []);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => {
      const itemId = typeof item === 'string' ? item : item._id;
      return itemId === productId;
    });
  };

  const handleAddToWishlist = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.info('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    const inWishlist = isInWishlist(productId);

    setWishlistLoading(prev => ({ ...prev, [productId]: true }));
    try {
      if (inWishlist) {
        // Remove from wishlist
        await wishlistService.removeFromWishlist(productId);
        setWishlist(wishlist.filter(item => {
          const itemId = typeof item === 'string' ? item : item._id;
          return itemId !== productId;
        }));
        toast.success('Removed from wishlist!');
      } else {
        // Add to wishlist
        await wishlistService.addToWishlist(productId);
        await loadWishlist(); // Reload to get the full product data
        toast.success('Added to wishlist!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      material: '',
      purity: '',
      minPrice: '',
      maxPrice: '',
      minWeight: '',
      maxWeight: '',
      inStock: '',
      sort: 'createdAt',
      page: 1
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value && key !== 'sort' && key !== 'page'
  ).length;

  return (
    <div className="shop-page">
      <div className="page-header">
        <div className="container">
          <h1>Shop</h1>
          <div className="breadcrumb">
            <Link to="/">Home</Link> / <span>Shop</span>
          </div>
        </div>
      </div>

      <div className="shop-content pt-60 pb-80">
        <div className="container">
          <div className="shop-layout">
            {/* Sidebar Filters */}
            <aside className={`shop-sidebar ${showFilters ? 'show' : ''}`}>
              <div className="sidebar-header">
                <h3>
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="filter-count">({activeFiltersCount})</span>
                  )}
                </h3>
                <button 
                  className="btn-close-sidebar"
                  onClick={() => setShowFilters(false)}
                >
                  ×
                </button>
              </div>

              {activeFiltersCount > 0 && (
                <button className="btn-clear-filters" onClick={clearFilters}>
                  Clear All Filters
                </button>
              )}

              {/* Search Filter */}
              <div className="filter-group">
                <h4>Search Products</h4>
                <div className="search-filter-box">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="search-filter-input"
                  />
                  {filters.search && (
                    <button 
                      className="clear-search-btn"
                      onClick={() => handleFilterChange('search', '')}
                      title="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter */}
              <div className="filter-group">
                <h4>Category</h4>
                <div className="filter-options">
                  {categories.map(cat => (
                    <label key={cat._id} className="filter-checkbox">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === cat._id}
                        onChange={() => handleFilterChange('category', cat._id)}
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Material Filter */}
              <div className="filter-group">
                <h4>Material</h4>
                <div className="filter-options">
                  {materials.map(material => (
                    <label key={material} className="filter-checkbox">
                      <input
                        type="radio"
                        name="material"
                        checked={filters.material === material}
                        onChange={() => handleFilterChange('material', material)}
                      />
                      <span>{material}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Purity Filter */}
              <div className="filter-group">
                <h4>Purity</h4>
                <div className="filter-options">
                  {purities.map(purity => (
                    <label key={purity} className="filter-checkbox">
                      <input
                        type="radio"
                        name="purity"
                        checked={filters.purity === purity}
                        onChange={() => handleFilterChange('purity', purity)}
                      />
                      <span>{purity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <h4>Price Range</h4>
                <div className="filter-range">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    onBlur={() => setFilters(prev => ({ ...prev, page: 1 }))}
                    className="form-control"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    onBlur={() => setFilters(prev => ({ ...prev, page: 1 }))}
                    className="form-control"
                  />
                </div>
              </div>

              {/* Weight Range */}
              <div className="filter-group">
                <h4>Weight (grams)</h4>
                <div className="filter-range">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minWeight}
                    onChange={(e) => setFilters(prev => ({ ...prev, minWeight: e.target.value }))}
                    onBlur={() => setFilters(prev => ({ ...prev, page: 1 }))}
                    className="form-control"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxWeight}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxWeight: e.target.value }))}
                    onBlur={() => setFilters(prev => ({ ...prev, page: 1 }))}
                    className="form-control"
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="filter-group">
                <h4>Availability</h4>
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.inStock === 'true'}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked ? 'true' : '')}
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </aside>

            {/* Main Content */}
            <div className="shop-main">
              {/* Toolbar */}
              <div className="shop-toolbar">
                <button 
                  className="btn-toggle-filters"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <span>🔍</span>
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="badge">{activeFiltersCount}</span>
                  )}
                </button>

                <div className="products-count">
                  {products.length > 0 ? (
                    <span>
                      {pagination.total ? 
                        `Showing ${((pagination.page - 1) * pagination.limit) + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} products` 
                        : `Showing ${products.length} products`
                      }
                    </span>
                  ) : null}
                </div>

                <div className="sort-select">
                  <label>Sort by:</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="form-control"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Loading products...</p>
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="products-grid">
                    {products.map(product => (
                      <div key={product._id} className="product-card">
                        <Link to={`/product/${product.slug}`}>
                          <div className="product-image">
                            <img
                              src={product.images[0]?.url || '/placeholder.jpg'}
                              alt={product.name}
                            />
                            {product.isFeatured && (
                              <span className="badge badge-featured">Featured</span>
                            )}
                            {!product.isActive && (
                              <span className="badge badge-inactive">Unavailable</span>
                            )}
                            <button
                              className={`wishlist-btn ${isInWishlist(product._id) ? 'in-wishlist' : ''}`}
                              onClick={(e) => handleAddToWishlist(product._id, e)}
                              disabled={wishlistLoading[product._id]}
                              title={isInWishlist(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                            >
                              {wishlistLoading[product._id] ? '...' : (isInWishlist(product._id) ? '♥' : '♡')}
                            </button>
                          </div>
                          <div className="product-info">
                            <h3 className="product-name">{product.name}</h3>
                            <div className="product-price">
                              <span className="price">${product.basePrice.toFixed(2)}</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="pagination">
                      <button
                        className="btn btn-outline"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        Previous
                      </button>

                      <div className="page-numbers">
                        {[...Array(pagination.pages)].map((_, i) => (
                          <button
                            key={i + 1}
                            className={`page-number ${pagination.page === i + 1 ? 'active' : ''}`}
                            onClick={() => handlePageChange(i + 1)}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        className="btn btn-outline"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-products">
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or search criteria</p>
                  <button className="btn" onClick={clearFilters}>
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {showFilters && (
        <div 
          className="sidebar-overlay"
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}

