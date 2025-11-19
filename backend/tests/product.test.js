const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Product = require('../models/Product.model');
const PricingConfig = require('../models/PricingConfig.model');

describe('Product Controller Tests', () => {
  let testProduct;
  let pricingConfig;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Create or get pricing config
    pricingConfig = await PricingConfig.findOne();
    if (!pricingConfig) {
      pricingConfig = await PricingConfig.create({
        compositions: {
          '10K': { rate: 25, enabled: true },
          '14K': { rate: 35, enabled: true },
          '18K': { rate: 45, enabled: true }
        },
        diamonds: {
          round: { pricePerCarat: 1000, enabled: true },
          princess: { pricePerCarat: 900, enabled: true }
        },
        additionalCosts: {
          laborCost: 50,
          profitMargin: 30
        }
      });
    }
  });

  afterAll(async () => {
    // Cleanup
    await Product.deleteMany({ name: /^Test Product/ });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create a test product
    testProduct = await Product.create({
      name: 'Test Product ' + Date.now(),
      slug: 'test-product-' + Date.now(),
      description: 'Test product description',
      category: 'Rings',
      weight: 5, // 5 grams
      availableOptions: {
        compositions: ['10K', '14K'],
        materials: ['Gold'],
        ringSizes: ['6', '7', '8'],
        diamondTypes: ['round'],
        diamondCarats: ['0.5', '1.0']
      },
      images: ['test-image.jpg'],
      isActive: true,
      totalStock: 100
    });
  });

  afterEach(async () => {
    if (testProduct && testProduct._id) {
      await Product.findByIdAndDelete(testProduct._id);
    }
  });

  describe('GET /api/products', () => {
    it('should return list of active products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('currentPage', 1);
      expect(response.body.pagination).toHaveProperty('limit', 5);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/products?category=Rings')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      response.body.data.forEach(product => {
        expect(product.category).toBe('Rings');
      });
    });
  });

  describe('GET /api/products/:slug', () => {
    it('should return product by slug', async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct.slug}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', testProduct.name);
      expect(response.body.data).toHaveProperty('slug', testProduct.slug);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/non-existent-slug-12345')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should include calculated price', async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct.slug}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('displayPrice');
      expect(typeof response.body.data.displayPrice).toBe('number');
      expect(response.body.data.displayPrice).toBeGreaterThan(0);
    });
  });

  describe('Product Price Calculation', () => {
    it('should calculate price based on weight and composition', async () => {
      const selectedOptions = {
        composition: '14K',
        material: 'Gold',
        ringSize: '7',
        diamondType: 'round',
        diamondCarat: '0.5'
      };

      const price = await testProduct.calculatePrice(selectedOptions);
      
      expect(typeof price).toBe('number');
      expect(price).toBeGreaterThan(0);
      
      // Price should be: weight * compositionRate + diamond price + labor + margin
      const expectedBase = 5 * 35; // 5g * $35/g = $175
      expect(price).toBeGreaterThan(expectedBase);
    });

    it('should calculate price range', async () => {
      const priceRange = await testProduct.calculatePriceRange();
      
      expect(priceRange).toHaveProperty('min');
      expect(priceRange).toHaveProperty('max');
      expect(priceRange.min).toBeLessThan(priceRange.max);
      expect(priceRange.min).toBeGreaterThan(0);
    });
  });

  describe('Product Search', () => {
    it('should search products by name', async () => {
      const response = await request(app)
        .get(`/api/products?search=${encodeURIComponent(testProduct.name.substring(0, 10))}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Product Stock', () => {
    it('should track stock correctly', async () => {
      expect(testProduct.totalStock).toBe(100);
      expect(testProduct.isInStock()).toBe(true);
    });

    it('should identify out of stock products', async () => {
      testProduct.totalStock = 0;
      await testProduct.save();

      expect(testProduct.isInStock()).toBe(false);
    });
  });
});
