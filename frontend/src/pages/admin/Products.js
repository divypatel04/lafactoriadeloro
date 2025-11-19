import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminService, productService } from '../../services';
import './Products.css';

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Pass includeInactive parameter to get all products for admin
      const response = await productService.getAllProducts({ limit: 1000, includeInactive: true });
      
      // The API returns products in response.data directly
      const productsData = Array.isArray(response.data) ? response.data : [];
      
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await adminService.deleteProduct(productId);
      // Remove from local state
      setProducts(products.filter(p => p._id !== productId));
      toast.success('Product deleted successfully');
      setShowDeleteConfirm(null);
      // Reload products to be sure
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading products...</div>;
  }

  // Filter and paginate products
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="admin-products">
      <div className="products-container">
        <div className="products-header">
          <div>
            <h1>Products Management</h1>
            <p className="products-count">Total: {filteredProducts.length} products</p>
          </div>
          <button 
            className="btn-add-product" 
            onClick={() => navigate('/admin/products/new')}
          >
            + Add New Product
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-bar" style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search products by name or slug..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div className="products-table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    <p>{searchTerm ? 'No products match your search.' : 'No products found. Import products or add new ones.'}</p>
                  </td>
                </tr>
              ) : (
                currentProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img 
                        src={product.images?.[0]?.url || product.images?.[0] || '/placeholder.jpg'} 
                        alt={product.name}
                        className="product-thumbnail"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100x100/f0f0f0/999?text=No+Image';
                        }}
                      />
                    </td>
                    <td>
                      <div className="product-name">{product.name}</div>
                      <div className="product-slug">{product.slug}</div>
                    </td>
                    <td>{product.category?.name || 'N/A'}</td>
                    <td>{product.stock || 0}</td>
                    <td>${product.basePrice?.toFixed(2) || '0.00'}</td>
                    <td>
                      <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-edit" 
                          onClick={() => navigate(`/admin/products/edit/${product.slug}`)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => setShowDeleteConfirm(product._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: currentPage === 1 ? '#f5f5f5' : 'white',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            <span style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '4px', background: '#f8f8f8' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: currentPage === totalPages ? '#f5f5f5' : 'white',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete this product? This action cannot be undone.</p>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowDeleteConfirm(null)}>
                  Cancel
                </button>
                <button className="btn-confirm-delete" onClick={() => handleDelete(showDeleteConfirm)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
