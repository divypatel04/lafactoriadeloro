import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { productService, categoryService, wishlistService, uploadService } from '../services';
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
    gender: searchParams.get('gender') || '',
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

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  const genderOptions = ['male', 'female', 'unisex'];
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

  // Update filters when URL parameters change
  useEffect(() => {
    const category = searchParams.get('category');
    const hasOnlyCategory = category && 
      !searchParams.get('gender') &&
      !searchParams.get('material') && 
      !searchParams.get('purity') && 
      !searchParams.get('minPrice') &&
      !searchParams.get('maxPrice') &&
      !searchParams.get('search');
    
    // If navigating with only category (from header), clear other filters
    if (hasOnlyCategory) {
      setFilters({
        search: '',
        category: category,
        gender: '',
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
    } else {
      // Normal sync
      setFilters({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        gender: searchParams.get('gender') || '',
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
    }
  }, [searchParams]);

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
      if (filters.gender) queryParams.gender = filters.gender;
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
      
      // Update URL with only meaningful filters (exclude defaults)
      const urlParams = {};
      if (filters.search) urlParams.search = filters.search;
      if (filters.category) urlParams.category = filters.category;
      if (filters.gender) urlParams.gender = filters.gender;
      if (filters.material) urlParams.material = filters.material;
      if (filters.purity) urlParams.purity = filters.purity;
      if (filters.minPrice) urlParams.minPrice = filters.minPrice;
      if (filters.maxPrice) urlParams.maxPrice = filters.maxPrice;
      if (filters.minWeight) urlParams.minWeight = filters.minWeight;
      if (filters.maxWeight) urlParams.maxWeight = filters.maxWeight;
      if (filters.inStock) urlParams.inStock = filters.inStock;
      // Only add sort if it's not the default
      if (filters.sort && filters.sort !== 'createdAt') urlParams.sort = filters.sort;
      // Only add page if it's not the first page
      if (filters.page && filters.page !== 1) urlParams.page = filters.page;
      
      setSearchParams(urlParams);
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

  const handleTempFilterChange = (key, value) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const openFilterModal = () => {
    setTempFilters(filters);
    setShowFilterModal(true);
  };

  const applyFilters = () => {
    setFilters({
      ...tempFilters,
      page: 1
    });
    setShowFilterModal(false);
  };

  const cancelFilters = () => {
    setTempFilters(filters);
    setShowFilterModal(false);
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
    const clearedFilters = {
      search: '',
      category: '',
      gender: '',
      material: '',
      purity: '',
      minPrice: '',
      maxPrice: '',
      minWeight: '',
      maxWeight: '',
      inStock: '',
      sort: 'createdAt',
      page: 1
    };
    setFilters(clearedFilters);
    setTempFilters(clearedFilters);
  };

  const clearTempFilters = () => {
    setTempFilters({
      search: '',
      category: '',
      gender: '',
      material: '',
      purity: '',
      minPrice: '',
      maxPrice: '',
      minWeight: '',
      maxWeight: '',
      inStock: '',
      sort: tempFilters.sort,
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
    ([key, value]) => value && key !== 'sort' && key !== 'page' && key !== 'search'
  ).length;

  const tempActiveFiltersCount = Object.entries(tempFilters).filter(
    ([key, value]) => value && key !== 'sort' && key !== 'page' && key !== 'search'
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
          <div className="shop-layout-full">

            {/* Toolbar */}
            <div className="shop-toolbar">
              <div className="toolbar-left">
                <button 
                  className="btn-filters"
                  onClick={openFilterModal}
                >
                  <span className="filter-icon">⚙</span>
                  <span>Filters & Sort</span>
                  {activeFiltersCount > 0 && (
                    <span className="badge">{activeFiltersCount}</span>
                  )}
                </button>
                {activeFiltersCount > 0 && (
                  <button className="btn-clear-all" onClick={clearFilters}>
                    Clear All ({activeFiltersCount})
                  </button>
                )}
              </div>

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
                            src={uploadService.getImageUrl(product.images[0]?.url)}
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

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="filter-modal-overlay" onClick={cancelFilters}>
          <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Filters & Sort</h2>
              <button className="btn-close-modal" onClick={cancelFilters}>×</button>
            </div>

            <div className="modal-body">
              {/* Top Row - Search and Sort */}
              <div className="filter-top-row">
                <div className="filter-group-inline">
                  <label className="filter-label">Search</label>
                  <div className="search-filter-box">
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={tempFilters.search}
                      onChange={(e) => handleTempFilterChange('search', e.target.value)}
                      className="search-filter-input"
                    />
                    {tempFilters.search && (
                      <button 
                        className="clear-search-btn"
                        onClick={() => handleTempFilterChange('search', '')}
                        title="Clear search"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                <div className="filter-group-inline">
                  <label className="filter-label">Sort By</label>
                  <select
                    value={tempFilters.sort}
                    onChange={(e) => handleTempFilterChange('sort', e.target.value)}
                    className="form-control"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group-inline">
                  <label className="filter-label">Availability</label>
                  <label className="filter-checkbox-inline">
                    <input
                      type="checkbox"
                      checked={tempFilters.inStock === 'true'}
                      onChange={(e) => handleTempFilterChange('inStock', e.target.checked ? 'true' : '')}
                    />
                    <span>In Stock Only</span>
                  </label>
                </div>
              </div>

              {/* Main Filters Grid */}
              <div className="modal-filters-grid">

                {/* Category Filter */}
                <div className="filter-group">
                  <h4>Category</h4>
                  <div className="filter-options">
                    <label className="filter-checkbox">
                      <input
                        type="radio"
                        name="category"
                        checked={!tempFilters.category}
                        onChange={() => handleTempFilterChange('category', '')}
                      />
                      <span>All Categories</span>
                    </label>
                    {categories.map(cat => (
                      <label key={cat._id} className="filter-checkbox">
                        <input
                          type="radio"
                          name="category"
                          checked={tempFilters.category === cat._id}
                          onChange={() => handleTempFilterChange('category', cat._id)}
                        />
                        <span>{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gender Filter */}
                <div className="filter-group">
                  <h4>Gender</h4>
                  <div className="filter-options">
                    <label className="filter-checkbox">
                      <input
                        type="radio"
                        name="gender"
                        checked={!tempFilters.gender}
                        onChange={() => handleTempFilterChange('gender', '')}
                      />
                      <span>All</span>
                    </label>
                    {genderOptions.map(gender => (
                      <label key={gender} className="filter-checkbox">
                        <input
                          type="radio"
                          name="gender"
                          checked={tempFilters.gender === gender}
                          onChange={() => handleTempFilterChange('gender', gender)}
                        />
                        <span style={{ textTransform: 'capitalize' }}>{gender}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Material Filter */}
                <div className="filter-group">
                  <h4>Material</h4>
                  <div className="filter-options">
                    <label className="filter-checkbox">
                      <input
                        type="radio"
                        name="material"
                        checked={!tempFilters.material}
                        onChange={() => handleTempFilterChange('material', '')}
                      />
                      <span>All Materials</span>
                    </label>
                    {materials.map(material => (
                      <label key={material} className="filter-checkbox">
                        <input
                          type="radio"
                          name="material"
                          checked={tempFilters.material === material}
                          onChange={() => handleTempFilterChange('material', material)}
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
                    <label className="filter-checkbox">
                      <input
                        type="radio"
                        name="purity"
                        checked={!tempFilters.purity}
                        onChange={() => handleTempFilterChange('purity', '')}
                      />
                      <span>All Purities</span>
                    </label>
                    {purities.map(purity => (
                      <label key={purity} className="filter-checkbox">
                        <input
                          type="radio"
                          name="purity"
                          checked={tempFilters.purity === purity}
                          onChange={() => handleTempFilterChange('purity', purity)}
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
                      placeholder="Min ($)"
                      value={tempFilters.minPrice}
                      onChange={(e) => handleTempFilterChange('minPrice', e.target.value)}
                      className="form-control"
                    />
                    <span className="range-separator">to</span>
                    <input
                      type="number"
                      placeholder="Max ($)"
                      value={tempFilters.maxPrice}
                      onChange={(e) => handleTempFilterChange('maxPrice', e.target.value)}
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
                      placeholder="Min (g)"
                      value={tempFilters.minWeight}
                      onChange={(e) => handleTempFilterChange('minWeight', e.target.value)}
                      className="form-control"
                    />
                    <span className="range-separator">to</span>
                    <input
                      type="number"
                      placeholder="Max (g)"
                      value={tempFilters.maxWeight}
                      onChange={(e) => handleTempFilterChange('maxWeight', e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={clearTempFilters}>
                Clear Filters {tempActiveFiltersCount > 0 && `(${tempActiveFiltersCount})`}
              </button>
              <div className="footer-right">
                <button className="btn btn-secondary" onClick={cancelFilters}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={applyFilters}>
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

