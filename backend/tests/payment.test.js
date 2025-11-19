const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Payment = require('../models/Order.model');
const User = require('../models/User.model');

describe('Payment Controller Tests', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    // Cleanup
    await User.deleteMany({ email: /test.*@payment\.com/ });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create test user and get auth token
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Payment',
        lastName: 'Test',
        email: `test.payment${Date.now()}@payment.com`,
        password: 'Test1234!',
        phone: '1234567890'
      });

    authToken = userResponse.body.token;
    testUser = userResponse.body.data;
  });

  describe('GET /api/payment/config', () => {
    it('should return Stripe publishable key', async () => {
      const response = await request(app)
        .get('/api/payment/config')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('publishableKey');
    });
  });

  describe('POST /api/payment/create-intent', () => {
    it('should create a payment intent with valid data', async () => {
      const response = await request(app)
        .post('/api/payment/create-intent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 10000, // $100.00
          currency: 'usd',
          orderId: new mongoose.Types.ObjectId()
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('clientSecret');
      expect(response.body.clientSecret).toMatch(/^pi_/);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/payment/create-intent')
        .send({
          amount: 10000,
          currency: 'usd'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail with invalid amount', async () => {
      const response = await request(app)
        .post('/api/payment/create-intent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: -100,
          currency: 'usd'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/payment/confirm', () => {
    it('should fail with invalid payment intent ID', async () => {
      const response = await request(app)
        .post('/api/payment/confirm')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentIntentId: 'invalid_id'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/payment/confirm')
        .send({
          paymentIntentId: 'pi_test123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/payment/webhook', () => {
    it('should reject webhook without signature', async () => {
      const response = await request(app)
        .post('/api/payment/webhook')
        .send({
          type: 'payment_intent.succeeded',
          data: {}
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
