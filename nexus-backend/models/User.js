import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function() { return this.authProvider === 'local'; },
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  googleId: {
    type: String,
  },
  role: {
    type: String,
    enum: ['investor', 'entrepreneur', 'admin'],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  profile: {
    avatarUrl: String,
    bio: String,
    company: String,
    startupName: String,
    industry: String,
    location: String,
    foundedYear: Number,
    pitchSummary: String,
    problemStatement: String,
    solution: String,
    marketOpportunity: String,
    competitiveAdvantage: String,
    teamSize: Number,
    fundingNeeded: String,
    valuation: String,
    investmentHistory: [String],
    preferences: [String],
    investmentStage: [String],
    investmentInterests: [String],
    portfolioCompanies: [String],
    totalInvestments: Number,
    minimumInvestment: String,
    maximumInvestment: String,
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    language: { type: String, default: 'English' },
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    isOnline: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },
    aiUsageCount: { type: Number, default: 0 },
    endorsements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    endorsementCount: { type: Number, default: 0 },
    priorityAccess: { 
      type: String, 
      enum: ['none', 'pending', 'approved'], 
      default: 'none' 
    },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    isVerified: { type: Boolean, default: false },
    otp: String,
    otpExpires: Date,
    walletBalance: { type: Number, default: 0 },
    subscription: {
      plan: { 
        type: String, 
        enum: ['starter', 'pro', 'enterprise'], 
        default: 'starter' 
      },
      status: { 
        type: String, 
        enum: ['active', 'past_due', 'cancelled'], 
        default: 'active' 
      },
      updatedAt: { type: Date, default: Date.now }
    }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true,
});

userSchema.pre('save', async function(options) {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Performance Indexes
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'profile.industry': 1 });
userSchema.index({ 'profile.isOnline': -1 });

const User = mongoose.model('User', userSchema);

export default User;
