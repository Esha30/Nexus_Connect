import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app, httpServer } from '../server.js';
import User from '../models/User.js';

let mongoServer;

beforeAll(async () => {
  // Disconnect from any running server to prevent interference
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '4.4.29',
      downloadDir: 'd:/Nexus/nexus-backend/.mongo-bin'
    }
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
  httpServer.close();
});

describe('Authentication API Endpoints', () => {
  const testUser = {
    name: 'Test Setup User',
    email: 'testauth@nexus.com',
    password: 'Password123!',
    role: 'entrepreneur'
  };

  it('should register a new user successfully and require verification', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
      
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('requiresVerification', true);
    expect(res.body).toHaveProperty('email', testUser.email);
  });

  it('should fail to register user with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bad@email.com' });
      
    expect(res.statusCode).toBe(400); // Validation error
  });

  it('should fail to register user with same email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
      
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  let token;

  it('should verify OTP and return a token', async () => {
    // Manually extract OTP from DB since email is mocked/captured
    const dbUser = await User.findOne({ email: testUser.email });
    const otp = dbUser.profile.otp;

    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: testUser.email, otp });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('email', testUser.email);
    token = res.body.token;
  });

  it('should authenticate user and return token directly if verified', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should fail authentication with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword1!'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Incorrect password/i);
  });

  it('should fetch user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', testUser.email);
  });
});
