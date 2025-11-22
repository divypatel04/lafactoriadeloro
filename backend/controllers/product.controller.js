const Product = require('../models/Product.model');

// @desc    Get all products with filters and pagination
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter query
    let filter = {};
    
    // Only filter by isActive if not explicitly requested to include inactive (for admin)
    if (req.query.includeInactive !== 'true') {
      filter.isActive = true;
    }

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Material filter
    if (req.query.material) {
      // Convert frontend material name to match database format
      const materialMap = {
        'Gold': 'yellow-gold',
        'Yellow Gold': 'yellow-gold',
        'White Gold': 'white-gold',
        'Rose Gold': 'rose-gold',
        'Silver': 'silver',
        'Platinum': 'platinum'
      };
      const materialValue = materialMap[req.query.material] || req.query.material.toLowerCase().replace(' ', '-');
      // Use $in operator for array matching
      filter['availableOptions.materials'] = { $in: [materialValue] };
    }

    // Purity/Composition filter
    if (req.query.purity) {
      // Use $in operator for array matching
      filter['availableOptions.compositions'] = { $in: [req.query.purity] };
    }

    // Weight filter
    if (req.query.minWeight || req.query.maxWeight) {
      filter.weight = {};
      if (req.query.minWeight) filter.weight.$gte = parseFloat(req.query.minWeight);
      if (req.query.maxWeight) filter.weight.$lte = parseFloat(req.query.maxWeight);
    }

    // Stock filter
    if (req.query.inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    // Price filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.basePrice = {};
      if (req.query.minPrice) filter.basePrice.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.basePrice.$lte = parseFloat(req.query.maxPrice);
    }

    // Featured, New, On Sale filters
    if (req.query.featured === 'true') filter.isFeatured = true;
    if (req.query.new === 'true') filter.isNew = true;
    if (req.query.onSale === 'true') filter.onSale = true;

    // Tags filter
    if (req.query.tags) {
      filter.tags = { $in: req.query.tags.split(',') };
    }

    // Search filter - using $and to combine with other filters
    if (req.query.search && req.query.search.trim()) {
      // Escape special regex characters
      const searchTerm = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(searchTerm, 'i'); // Case-insensitive search
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { sku: searchRegex },
        { tags: searchRegex }
      ];
    }

    // Sorting
    let sort = {};
    if (req.query.sort) {
      const sortValue = req.query.sort;
      
      // Handle different sort formats
      if (sortValue === 'basePrice' || sortValue === 'price-asc') {
        sort.basePrice = 1;
      } else if (sortValue === '-basePrice' || sortValue === 'price-desc') {
        sort.basePrice = -1;
      } else if (sortValue === 'name' || sortValue === 'name-asc') {
        sort.name = 1;
      } else if (sortValue === '-name' || sortValue === 'name-desc') {
        sort.name = -1;
      } else if (sortValue === 'createdAt' || sortValue === 'newest') {
        sort.createdAt = -1;
      } else if (sortValue === '-createdAt' || sortValue === 'oldest') {
        sort.createdAt = 1;
      } else if (sortValue === 'rating' || sortValue === '-averageRating') {
        sort.averageRating = -1;
      } else {
        // Default sort
        sort.createdAt = -1;
      }
    } else {
      sort.createdAt = -1;
    }

    // Execute query
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        limit
      }
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// @desc    Search products
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const products = await Product.find(
      { $text: { $search: q }, isActive: true },
      { score: { $meta: 'textScore' } }
    )
      .populate('category', 'name slug')
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);

    res.status(200).json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
};

// @desc    Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .limit(limit)
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured products',
      error: error.message
    });
  }
};

// @desc    Get product by slug
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug')
      .populate('relatedProducts');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// @desc    Create new product (Admin)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// @desc    Update product (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// @desc    Delete product (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};
