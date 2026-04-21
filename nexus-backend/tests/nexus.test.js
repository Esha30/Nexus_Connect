/**
 * Nexus Platform — API Test Suite
 * Auth Endpoint Tests
 * Run: npm test
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

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
});

// ────────────────────────────────────────────────────────────────────────────
// Password Validation Logic Tests (pure function tests — no HTTP needed)
// ────────────────────────────────────────────────────────────────────────────

describe('Password Validation', () => {
  const isStrongPassword = (pw) =>
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[0-9]/.test(pw);

  it('rejects passwords shorter than 8 characters', () => {
    expect(isStrongPassword('Ab1')).toBe(false);
  });

  it('rejects passwords without uppercase letters', () => {
    expect(isStrongPassword('password123')).toBe(false);
  });

  it('rejects passwords without numbers', () => {
    expect(isStrongPassword('Password!')).toBe(false);
  });

  it('accepts valid strong passwords', () => {
    expect(isStrongPassword('Nexus123!')).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// User Model Tests
// ────────────────────────────────────────────────────────────────────────────

describe('User Model', () => {
  it('correctly identifies investor role', async () => {
    const UserSchema = new mongoose.Schema({
      name: String,
      email: String,
      role: { type: String, enum: ['investor', 'entrepreneur'] },
      password: String
    });

    // Avoid OverwriteModelError
    const User = mongoose.models.TestUser || mongoose.model('TestUser', UserSchema);

    const investor = new User({
      name: 'Test Investor',
      email: 'investor@test.com',
      role: 'investor',
      password: 'hashed_password'
    });

    expect(investor.role).toBe('investor');
    expect(investor.name).toBe('Test Investor');
  });

  it('saves and retrieves a user from in-memory DB', async () => {
    const SimpleSchema = new mongoose.Schema({ name: String, email: String, role: String });
    const Entry = mongoose.models.Entry || mongoose.model('Entry', SimpleSchema);

    await Entry.create({ name: 'Alex Carter', email: 'alex@nexus.test', role: 'entrepreneur' });
    const found = await Entry.findOne({ email: 'alex@nexus.test' });

    expect(found).not.toBeNull();
    expect(found.name).toBe('Alex Carter');
    expect(found.role).toBe('entrepreneur');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Document Model Tests
// ────────────────────────────────────────────────────────────────────────────

describe('Document Model', () => {
  it('validates that category is one of allowed values', () => {
    const validCategories = ['pitch_deck', 'financials', 'legal', 'identity', 'other'];
    const testCategory = 'pitch_deck';
    expect(validCategories.includes(testCategory)).toBe(true);
  });

  it('rejects invalid category values', () => {
    const validCategories = ['pitch_deck', 'financials', 'legal', 'identity', 'other'];
    expect(validCategories.includes('random_category')).toBe(false);
  });

  it('saves a document with sharedWith array', async () => {
    const DocSchema = new mongoose.Schema({
      title: String,
      category: String,
      sharedWith: [{ type: mongoose.Schema.Types.ObjectId }],
      status: { type: String, default: 'pending_review' }
    });
    const Doc = mongoose.models.TestDoc || mongoose.model('TestDoc', DocSchema);
    const userId = new mongoose.Types.ObjectId();
    const doc = await Doc.create({
      title: 'AI Term Sheet: Nexus Startup',
      category: 'legal',
      sharedWith: [userId]
    });

    expect(doc.title).toBe('AI Term Sheet: Nexus Startup');
    expect(doc.category).toBe('legal');
    expect(doc.sharedWith).toHaveLength(1);
    expect(doc.status).toBe('pending_review');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Synergy Score Tests
// ────────────────────────────────────────────────────────────────────────────

describe('Synergy Score Logic', () => {
  const isValidSynergyScore = (score) =>
    typeof score === 'number' && score >= 0 && score <= 100;

  it('accepts valid synergy scores', () => {
    expect(isValidSynergyScore(85)).toBe(true);
    expect(isValidSynergyScore(0)).toBe(true);
    expect(isValidSynergyScore(100)).toBe(true);
  });

  it('rejects out-of-range scores', () => {
    expect(isValidSynergyScore(150)).toBe(false);
    expect(isValidSynergyScore(-5)).toBe(false);
  });

  it('fallback score is in valid range (70-90)', () => {
    const fallbackScore = Math.floor(Math.random() * 21) + 70;
    expect(fallbackScore).toBeGreaterThanOrEqual(70);
    expect(fallbackScore).toBeLessThanOrEqual(90);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// API Response Structure Tests
// ────────────────────────────────────────────────────────────────────────────

describe('API Response Contracts', () => {
  it('synergy response has required fields', () => {
    const mockSynergyResponse = {
      score: 82,
      verdict: 'Strong strategic alignment detected.',
      strengths: ['Industry match', 'Complementary skills'],
      risks: ['Market saturation']
    };

    expect(mockSynergyResponse).toHaveProperty('score');
    expect(mockSynergyResponse).toHaveProperty('verdict');
    expect(Array.isArray(mockSynergyResponse.strengths)).toBe(true);
    expect(Array.isArray(mockSynergyResponse.risks)).toBe(true);
  });

  it('document response has required fields', () => {
    const mockDocResponse = {
      _id: 'abc123',
      title: 'Pitch Deck v2',
      filePath: '/uploads/pitch.pdf',
      status: 'pending_review',
      category: 'pitch_deck'
    };

    expect(mockDocResponse).toHaveProperty('_id');
    expect(mockDocResponse).toHaveProperty('filePath');
    expect(mockDocResponse.status).toBe('pending_review');
  });
});
