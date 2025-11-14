const request = require('supertest');
const app = require('../src/index');
const Item = require('../src/models/Item');
const User = require('../src/models/User');
const mongoose = require('mongoose');

let token;
let userId;

beforeAll(async () => {
  // Create a test user and get token
  const res = await request(app)
    .post('/api/auth/signup')
    .send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
  token = res.body.token;
  userId = res.body.user.id;
});

afterAll(async () => {
  await Item.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Item Routes', () => {
  it('should create an item', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Test Item')
      .field('description', 'A test item')
      .field('category', 'Clothing')
      .field('condition', 'new');
    expect(res.statusCode).toEqual(201);
    expect(res.body.title).toBe('Test Item');
  });

  it('should list items', async () => {
    const res = await request(app)
      .get('/api/items');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('should get user items', async () => {
    const res = await request(app)
      .get('/api/items/my')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});