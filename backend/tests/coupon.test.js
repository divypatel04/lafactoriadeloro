const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Coupon = require('../models/Coupon.model');
const User = require('../models/User.model');

describe('Coupon Controller Tests', () => {
  let authToken;
  let adminToken;
  let testUser;
  let adminUser;
  let testCoupon;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    // Cleanup
    await User.deleteMany({ email: /test.*@coupon\.com/ });
    await Coupon.deleteMany({ code: /^TEST/ });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create test customer
    const customerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Coupon',
        lastName: 'Customer',
        email: `test.customer${Date.now()}@coupon.com`,
        password: 'Test1234!',
        phone: '1234567890'
      });

    authToken = customerResponse.body.token;
    testUser = customerResponse.body.data;

    // Create test admin
    adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: `test.admin${Date.now()}@coupon.com`,
      password: 'Test1234!',
      phone: '9876543210',
      role: 'admin'
    });

    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: adminUser.email,
        password: 'Test1234!'
      });

    adminToken = adminLoginResponse.body.token;

    // Create test coupon
    testCoupon = await Coupon.create({
      code: 'TEST' + Date.now(),
      type: 'percentage',
      value: 10,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      usageLimit: 100,
      isActive: true
    });
  });

  afterEach(async () => {
    if (testCoupon && testCoupon._id) {
      await Coupon.findByIdAndDelete(testCoupon._id);
    }
  });

  describe('POST /api/coupons/validate', () => {
    it('should validate a valid coupon', async () => {
      const response = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: testCoupon.code,
          orderTotal: 100
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('code', testCoupon.code);
      expect(response.body.data).toHaveProperty('type', 'percentage');
      expect(response.body.data).toHaveProperty('value', 10);
      expect(response.body.data).toHaveProperty('discount');
      expect(response.body.data.discount).toBe(10); // 10% of 100
    });

    it('should reject expired coupon', async () => {
      testCoupon.expiryDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      await testCoupon.save();

      const response = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: testCoupon.code,
          orderTotal: 100
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/expired/i);
    });

    it('should reject inactive coupon', async () => {
      testCoupon.isActive = false;
      await testCoupon.save();

      const response = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: testCoupon.code,
          orderTotal: 100
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject coupon below minimum order', async () => {
      testCoupon.minOrderAmount = 200;
      await testCoupon.save();

      const response = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: testCoupon.code,
          orderTotal: 100
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/minimum.*200/i);
    });

    it('should reject non-existent coupon', async () => {
      const response = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'NONEXISTENT',
          orderTotal: 100
        })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should calculate fixed amount discount', async () => {
      testCoupon.type = 'fixed';
      testCoupon.value = 20;
      await testCoupon.save();

      const response = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: testCoupon.code,
          orderTotal: 100
        })
        .expect(200);

      expect(response.body.data.discount).toBe(20);
    });
  });

  describe('POST /api/coupons (Admin)', () => {
    it('should create new coupon', async () => {
      const response = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'NEWTEST' + Date.now(),
          type: 'percentage',
          value: 15,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('code');
      expect(response.body.data).toHaveProperty('value', 15);

      // Cleanup
      await Coupon.findByIdAndDelete(response.body.data._id);
    });

    it('should reject duplicate coupon code', async () => {
      const response = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: testCoupon.code,
          type: 'percentage',
          value: 20
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'SHOULDFAIL',
          type: 'percentage',
          value: 10
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/coupons (Admin)', () => {
    it('should list all coupons', async () => {
      const response = await request(app)
        .get('/api/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .get('/api/coupons')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/coupons/:id (Admin)', () => {
    it('should update coupon', async () => {
      const response = await request(app)
        .put(`/api/coupons/${testCoupon._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          value: 20
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('value', 20);
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .put(`/api/coupons/${testCoupon._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          value: 20
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/coupons/:id (Admin)', () => {
    it('should delete coupon', async () => {
      const tempCoupon = await Coupon.create({
        code: 'TODELETE' + Date.now(),
        type: 'fixed',
        value: 10
      });

      const response = await request(app)
        .delete(`/api/coupons/${tempCoupon._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);

      // Verify deletion
      const deleted = await Coupon.findById(tempCoupon._id);
      expect(deleted).toBeNull();
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .delete(`/api/coupons/${testCoupon._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
