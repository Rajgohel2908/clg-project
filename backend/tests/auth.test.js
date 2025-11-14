const request = require('supertest');
const app = require('../src/index'); // Assuming index.js exports the app
const User = require('../src/models/User');
const mongoose = require('mongoose');

beforeAll(async () => {
  // Connect to test DB if needed, or use memory
  // For simplicity, assume .env has test DB
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Auth Routes', () => {
  it('should signup a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('should not signup with existing email', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Another User',
        email: 'test@example.com',
        password: 'password456'
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('User with this email already exists');
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Invalid credentials');
  });
});