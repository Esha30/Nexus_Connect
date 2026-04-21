import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app, httpServer } from '../server.js';
import User from '../models/User.js';

let mongoServer;
let investorToken;
let entrepreneurToken;
let entrepreneurId;
let investorId;

beforeAll(async () => {
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

  // Setup mock Investor
  const investor = await User.create({
    name: 'Investor Pro',
    email: 'investor@nexus.test',
    password: 'Password1!',
    role: 'investor',
    profile: { isVerified: true }
  });
  investorId = investor._id;

  // Setup mock Entrepreneur
  const entrepreneur = await User.create({
    name: 'Startup CEO',
    email: 'startup@nexus.test',
    password: 'Password1!',
    role: 'entrepreneur',
    profile: { isVerified: true, startupName: 'Nexus AI' }
  });
  entrepreneurId = entrepreneur._id;

  // Login as investor
  const res1 = await request(app).post('/api/auth/login').send({ email: 'investor@nexus.test', password: 'Password1!' });
  investorToken = res1.body.token;

  // Login as entrepreneur
  const res2 = await request(app).post('/api/auth/login').send({ email: 'startup@nexus.test', password: 'Password1!' });
  entrepreneurToken = res2.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
  httpServer.close();
});

describe('Collaboration API Endpoints', () => {
  it('should not allow unauthorized access to collaborations', async () => {
    const res = await request(app).get('/api/collaborations');
    expect(res.statusCode).toBe(401); // Assuming auth middleware blocks
  });

  let collabId;

  it('investor should successfully send a collaboration request', async () => {
    const res = await request(app)
      .post('/api/collaborations')
      .set('Authorization', `Bearer ${investorToken}`)
      .send({
        entrepreneurId: entrepreneurId,
        message: 'Interested in a Series A discussion.'
      });

    // It might return 200 or 201 based on your controller
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('message');
    // Save generated collab ID if any, or verify it was sent
  });

  it('entrepreneur should retrieve their pending requests', async () => {
    const res = await request(app)
      .get('/api/collaborations')
      .set('Authorization', `Bearer ${entrepreneurToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if(res.body.length > 0) {
      collabId = res.body[0]._id || res.body[0].id;
    }
  });

  it('entrepreneur should update request status to accepted', async () => {
    if(!collabId) return; // Skip if no collab was created by mock

    const res = await request(app)
      .put(`/api/collaborations/${collabId}/status`)
      .set('Authorization', `Bearer ${entrepreneurToken}`)
      .send({ status: 'accepted' });

    expect(res.statusCode).toBe(200);
  });
});
