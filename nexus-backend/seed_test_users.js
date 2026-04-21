import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './config/db.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

await connectDB();

const passwordHash = await bcrypt.hash('Test1234!', 10);

// Create Entrepreneur
const entrepreneur = await User.findOneAndUpdate(
  { email: 'entrepreneur@nexus.test' },
  {
    $set: {
      name: 'Alex Carter',
      email: 'entrepreneur@nexus.test',
      password: passwordHash,
      role: 'entrepreneur',
      authProvider: 'local',
      'profile.isVerified': true,
      'profile.startupName': 'EcoSync AI',
      'profile.industry': 'CleanTech',
      'profile.location': 'San Francisco, CA',
      'profile.foundedYear': 2022,
      'profile.teamSize': 8,
      'profile.bio': 'Building AI-powered energy optimization tools for commercial buildings. We help facilities reduce carbon footprint while saving on operational costs.',
      'profile.pitchSummary': 'We cut building energy costs by 40% using real-time AI — no hardware required.',
      'profile.problemStatement': 'Commercial buildings waste 30% of their energy due to legacy HVAC and lighting systems with no smart control.',
      'profile.solution': 'Our SaaS platform plugs into existing BMS systems and uses ML to optimize energy in real-time.',
      'profile.marketOpportunity': '$12B global smart building market growing at 25% CAGR.',
      'profile.fundingNeeded': '$2,000,000',
      'profile.valuation': '$12,000,000',
    }
  },
  { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
);
console.log('✅ Entrepreneur created:', entrepreneur.email, '| id:', entrepreneur._id);

// Create Investor
const investor = await User.findOneAndUpdate(
  { email: 'investor@nexus.test' },
  {
    $set: {
      name: 'Sarah Mitchell',
      email: 'investor@nexus.test',
      password: passwordHash,
      role: 'investor',
      authProvider: 'local',
      'profile.isVerified': true,
      'profile.company': 'Apex Ventures',
      'profile.location': 'New York, NY',
      'profile.bio': 'Partner at Apex Ventures. Focused on early-stage B2B SaaS and CleanTech. 12+ years in venture capital with 4 successful exits.',
      'profile.totalInvestments': 12,
      'profile.minimumInvestment': '$250,000',
      'profile.maximumInvestment': '$5,000,000',
      'profile.investmentInterests': ['CleanTech', 'SaaS', 'FinTech', 'AI/ML'],
      'profile.investmentStage': ['Seed', 'Series A'],
      'profile.portfolioCompanies': ['GreenFlow', 'DataPulse', 'Linkify', 'NexaHealth'],
    }
  },
  { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
);
console.log('✅ Investor created:', investor.email, '| id:', investor._id);

console.log('\n🔑 TEST CREDENTIALS:');
console.log('  Entrepreneur → entrepreneur@nexus.test / Test1234!');
console.log('  Investor     → investor@nexus.test / Test1234!');

process.exit(0);
