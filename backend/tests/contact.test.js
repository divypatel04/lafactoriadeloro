const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Contact = require('../models/Contact.model');
const User = require('../models/User.model');

describe('Contact Endpoints', () => {
  let adminToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    // Create admin user
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@test.com',
        password: 'Admin123!@#',
        phone: '1234567890',
        role: 'admin'
      });

    adminToken = adminRes.body.data.token;

    // Update user role to admin
    await User.findOneAndUpdate(
      { email: 'admin@test.com' },
      { role: 'admin' }
    );
  });

  afterAll(async () => {
    await Contact.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Contact.deleteMany({});
  });

  describe('POST /api/contact', () => {
    it('should submit contact form successfully', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        subject: 'Product Inquiry',
        message: 'I would like to know more about your products.'
      };

      const res = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('received');
      expect(res.body.data).toHaveProperty('name', contactData.name);
      expect(res.body.data).toHaveProperty('status', 'new');
    });

    it('should fail with missing required fields', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com'
        // Missing subject and message
      };

      const res = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid email', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'invalid-email',
        subject: 'Test',
        message: 'Test message'
      };

      const res = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/contact', () => {
    beforeEach(async () => {
      // Create some test contacts
      await Contact.create([
        {
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Inquiry 1',
          message: 'Message 1',
          status: 'new'
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          subject: 'Inquiry 2',
          message: 'Message 2',
          status: 'read'
        }
      ]);
    });

    it('should get all contacts for admin', async () => {
      const res = await request(app)
        .get('/api/contact')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.contacts).toHaveLength(2);
      expect(res.body.data.pagination).toHaveProperty('total', 2);
    });

    it('should filter contacts by status', async () => {
      const res = await request(app)
        .get('/api/contact?status=new')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.contacts).toHaveLength(1);
      expect(res.body.data.contacts[0]).toHaveProperty('status', 'new');
    });

    it('should fail without admin token', async () => {
      const res = await request(app)
        .get('/api/contact')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/contact/:id', () => {
    let contactId;

    beforeEach(async () => {
      const contact = await Contact.create({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test',
        message: 'Test message',
        status: 'new'
      });
      contactId = contact._id;
    });

    it('should update contact status', async () => {
      const res = await request(app)
        .put(`/api/contact/${contactId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'replied' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('status', 'replied');
    });

    it('should fail with invalid status', async () => {
      const res = await request(app)
        .put(`/api/contact/${contactId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid-status' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/contact/:id/reply', () => {
    let contactId;

    beforeEach(async () => {
      const contact = await Contact.create({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test',
        message: 'Test message',
        status: 'new'
      });
      contactId = contact._id;
    });

    it('should reply to contact inquiry', async () => {
      const res = await request(app)
        .post(`/api/contact/${contactId}/reply`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ message: 'Thank you for contacting us!' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.response).toHaveProperty('message', 'Thank you for contacting us!');
      expect(res.body.data).toHaveProperty('status', 'replied');
    });

    it('should fail without message', async () => {
      const res = await request(app)
        .post(`/api/contact/${contactId}/reply`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/contact/:id', () => {
    let contactId;

    beforeEach(async () => {
      const contact = await Contact.create({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test',
        message: 'Test message'
      });
      contactId = contact._id;
    });

    it('should delete contact', async () => {
      const res = await request(app)
        .delete(`/api/contact/${contactId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted');

      // Verify deletion
      const contact = await Contact.findById(contactId);
      expect(contact).toBeNull();
    });

    it('should fail with invalid ID', async () => {
      const res = await request(app)
        .delete('/api/contact/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);

      expect(res.body.success).toBe(false);
    });
  });
});
