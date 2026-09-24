// Authentication Integration Tests
 
import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app';
import { userFactory } from '../factories/user.factory';

const hasTestDatabase = Boolean(
  process.env['TEST_DATABASE_URL']
);

(hasTestDatabase ? describe : describe.skip)('Authentication API', () => {
  describe('POST /api/v1/auth/register', () => {
    test('should register a new customer', async () => {
      const userData = {
        email: 'newcustomer@test.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'Customer',
        role: 'CUSTOMER',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.tokens).toBeDefined();
    });

    test('should reject duplicate email', async () => {
      // Create existing user
      await userFactory.createCustomer({ email: 'existing@test.com' });

      const userData = {
        email: 'existing@test.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
    });

    test('should reject invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject weak password', async () => {
      const userData = {
        email: 'test@test.com',
        password: 'weak',
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    test('should login with valid credentials', async () => {
      // Create test user
      const password = 'Password123!';
      const user = await userFactory.createCustomer({ password });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    test('should reject invalid password', async () => {
      const user = await userFactory.createCustomer();

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Password123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should reject unverified email', async () => {
      const password = 'Password123!';
      const user = await userFactory.createCustomer({
        password,
        emailVerified: false,
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    test('should get authenticated user profile', async () => {
      const user = await userFactory.createCustomer();
      
      // Login to get token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: 'Password123!',
        });

      const token = loginResponse.body.data.tokens.accessToken;

      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(user.id);
      expect(response.body.data.user.email).toBe(user.email);
    });

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
