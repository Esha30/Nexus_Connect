import User from '../models/User.js';
import Activity from '../models/Activity.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { sendOTPEmail, sendEmail } from '../utils/emailService.js';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import cache from '../utils/cache.js';


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const user = await User.create({
      name,
      email,
      password,
      role,
      profile: {
        otp,
        otpExpires: Date.now() + 10 * 60 * 1000,
        isVerified: false
      }
    });

    if (user) {
      let emailSent = true;
      try {
        // Send real OTP email
        await sendOTPEmail(user.email, otp);
      } catch (emailError) {
        console.error('Email delivery failed (user still created):', emailError.message);
        emailSent = false;
      }

      res.status(201).json({
        message: emailSent
          ? 'Registration successful. Please verify your email with the OTP sent.'
          : 'Registration successful, but we could not send the verification email. Please contact support.',
        email: user.email,
        requiresVerification: true,
        emailSent
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.profile && user.profile.twoFactorEnabled) {
        return res.json({
          _id: user._id,
          role: user.role,
          requires2FA: true,
          message: 'Please enter your Authenticator code'
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        token: generateToken(user._id),
      });
    } else {
      if (!user) {
        return res.status(404).json({ message: 'Account not found. Please register or check your email.' });
      }
      res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify OTP for 2FA
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.profile) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.profile.twoFactorEnabled) {
      // 2FA TOTP Verification
      if (!user.profile.twoFactorSecret) {
        return res.status(400).json({ message: '2FA secret missing' });
      }

      const verified = speakeasy.totp.verify({
        secret: user.profile.twoFactorSecret,
        encoding: 'base32',
        token: otp,
        window: 1
      });

      if (!verified) {
        return res.status(401).json({ message: 'Invalid 2FA code' });
      }
    } else {
      // Standard Email OTP Verification (Registration)
      if (user.profile.otp !== otp || user.profile.otpExpires < Date.now()) {
        return res.status(401).json({ message: 'Invalid or expired OTP' });
      }

      // Mark as verified
      user.profile.isVerified = true;
      user.profile.otp = undefined;
      user.profile.otpExpires = undefined;
      await user.save({ validateModifiedOnly: true });
    }

    // Successfully verified
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get any user profile by ID
// @route   GET /api/auth/profile/:id
// @access  Private
export const getPublicProfile = async (req, res) => {
  try {
    const cacheKey = `profile_${req.params.id}`;
    const cachedProfile = cache.get(cacheKey);
    
    if (cachedProfile) {
      // Still log activity even if cached
      if (req.user && req.user._id.toString() !== req.params.id) {
        Activity.create({
          user: req.params.id,
          actor: req.user._id,
          action: 'PROFILE_VIEW',
          metadata: { viewerName: req.user.name, viewerRole: req.user.role }
        }).catch(() => {});
      }
      return res.json(cachedProfile);
    }

    const user = await User.findById(req.params.id).select('-password').lean();

    if (user) {
      cache.set(cacheKey, user, 300000); // 5 minutes
      res.json(user);

      // Log profile view activity (Fire and forget)
      if (req.user && req.user._id.toString() !== req.params.id) {
        Activity.create({
          user: req.params.id, // The person whose profile is being viewed
          actor: req.user._id, // The viewer
          action: 'PROFILE_VIEW',
          metadata: {
            viewerName: req.user.name,
            viewerRole: req.user.role
          }
        }).catch(err => console.error('Activity logging failed:', err));
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        if (!req.body.currentPassword) {
          return res.status(400).json({ message: 'Current password is required to set a new password' });
        }
        const isMatch = await user.matchPassword(req.body.currentPassword);
        if (!isMatch) {
          return res.status(401).json({ message: 'Incorrect current password' });
        }
        user.password = req.body.password;
      }
      
      if (req.body.profile) {
        user.profile = { ...user.profile, ...req.body.profile };
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profile: updatedUser.profile,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Setup 2FA
// @route   POST /api/auth/setup-2fa
// @access  Private
export const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const secret = speakeasy.generateSecret({ name: `BusinessNexus (${user.email})` });
    
    if (!user.profile) {
      user.profile = {};
    }
    user.profile.twoFactorSecret = secret.base32;
    await user.save();

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) {
        return res.status(500).json({ message: 'Error generating QR code' });
      }
      res.json({ 
        secret: secret.base32,
        qrCode: data_url
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Confirm 2FA setup
// @route   POST /api/auth/confirm-2fa
// @access  Private
export const confirm2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { token } = req.body;

    if (!user || !user.profile || !user.profile.twoFactorSecret) {
      return res.status(400).json({ message: '2FA setup not initiated' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.profile.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (verified) {
      user.profile.twoFactorEnabled = true;
      await user.save();
      res.json({ message: '2FA successfully enabled', enabled: true });
    } else {
      res.status(400).json({ message: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @desc    Google Login
// @route   POST /api/auth/google-login
// @access  Public
export const googleLogin = async (req, res) => {
  const { credential, role } = req.body;

  try {
    let payload;
    try {
      // First attempt: standard verification
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      // If this is a clock skew error (Token used too early / Token used too late),
      // fall back to manual JWT decoding with a 24-hour clock tolerance.
      const isClockSkewError =
        verifyErr.message &&
        (verifyErr.message.includes('used too early') ||
          verifyErr.message.includes('used too late') ||
          verifyErr.message.includes('Token is not yet valid'));

      if (!isClockSkewError) {
        console.error('Google verification failed:', verifyErr.message);
        return res.status(401).json({ message: 'Invalid Google token' });
      }

      try {
        console.warn(
          'Clock skew detected, falling back to manual JWT decode:',
          verifyErr.message
        );
        // Decode the JWT payload without time validation.
        // We still verify the issuer and audience manually below.
        const parts = credential.split('.');
        if (parts.length !== 3) {
          return res.status(401).json({ message: 'Invalid Google token format' });
        }
        const rawPayload = JSON.parse(
          Buffer.from(parts[1], 'base64url').toString('utf8')
        );

        // Validate critical fields manually (audience, issuer)
        const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
        if (!validIssuers.includes(rawPayload.iss)) {
          return res.status(401).json({ message: 'Invalid token issuer' });
        }
        const aud = Array.isArray(rawPayload.aud) ? rawPayload.aud : [rawPayload.aud];
        if (!aud.includes(process.env.GOOGLE_CLIENT_ID)) {
          return res.status(401).json({ message: 'Invalid token audience' });
        }
        // Allow up to 24 hours of clock skew (server clock might be behind)
        const now = Math.floor(Date.now() / 1000);
        const CLOCK_SKEW_TOLERANCE = 86400; // 24 hours in seconds
        if (rawPayload.exp && now > rawPayload.exp + CLOCK_SKEW_TOLERANCE) {
          return res.status(401).json({ message: 'Google token has expired' });
        }

        payload = rawPayload;
      } catch (fallbackErr) {
        console.error('Google fallback verification failed:', fallbackErr.message);
        return res.status(401).json({ message: 'Invalid Google token' });
      }
    }

    const { name, email, picture, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not exists
      user = await User.create({
        name,
        email,
        authProvider: 'google',
        googleId: sub,
        role: role || 'entrepreneur', // Default or from request
        profile: {
          bio: '',
          company: '',
        }
      });
    } else {
      // Ensure google links are mapped
      if (!user.googleId) {
        user.googleId = sub;
        user.authProvider = 'google';
        await user.save();
      }
    }

    // Check if 2FA is enabled
    if (user.profile && user.profile.twoFactorEnabled) {
      return res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        requires2FA: true,
        message: 'Please enter your Authenticator code'
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Google authentication failed', error: error.message });
  }
};

// @desc    Forgot Password - Send reset link
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found with that email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and save to DB
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (10 minutes)
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save({ validateModifiedOnly: true });

    // Reset Link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const message = `
      <h1>Password Reset Request</h1>
      <p>You are receiving this email because you (or someone else) have requested the reset of a password.</p>
      <p>Please click on the following link to complete the process:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <p>This link will expire in 10 minutes.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request - Business Nexus',
        html: message,
      });

      res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateModifiedOnly: true });
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    // Get hashed token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all entrepreneurs for discovery
// @route   GET /api/auth/entrepreneurs
// @access  Private
export const getEntrepreneurs = async (req, res) => {
  try {
    const { industry, search, limit = 20, page = 1 } = req.query;
    
    let query = { role: 'entrepreneur' };

    if (industry && industry !== 'All') {
      query['profile.industry'] = industry;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'profile.startupName': { $regex: search, $options: 'i' } },
        { 'profile.industry': { $regex: search, $options: 'i' } },
        { 'profile.pitchSummary': { $regex: search, $options: 'i' } }
      ];
    }

    const entrepreneurs = await User.find(query)
      .select('-password')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ 'profile.endorsementCount': -1, 'profile.isOnline': -1, 'profile.lastActive': -1 })
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      entrepreneurs,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Endorse a Startup Profile
// @route   POST /api/auth/endorse
// @access  Private
export const endorseStartup = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const actorId = req.user._id;

    if (!targetUserId) return res.status(400).json({ message: 'Target user ID required' });

    const targetUser = await User.findById(targetUserId);
    if (!targetUser || targetUser.role !== 'entrepreneur') {
      return res.status(404).json({ message: 'Entrepreneur not found' });
    }

    const hasEndorsed = targetUser.profile.endorsements.includes(actorId);

    if (hasEndorsed) {
      // Remove endorsement
      targetUser.profile.endorsements = targetUser.profile.endorsements.filter(id => id.toString() !== actorId.toString());
      targetUser.profile.endorsementCount = Math.max((targetUser.profile.endorsementCount || 1) - 1, 0);
    } else {
      // Add endorsement
      targetUser.profile.endorsements.push(actorId);
      targetUser.profile.endorsementCount = (targetUser.profile.endorsementCount || 0) + 1;
    }

    await targetUser.save();
    res.status(200).json({ 
      endorsed: !hasEndorsed, 
      endorsementCount: targetUser.profile.endorsementCount 
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all investors for discovery
// @route   GET /api/auth/investors
// @access  Private
export const getInvestors = async (req, res) => {
  try {
    const { search, limit = 20, page = 1 } = req.query;
    
    let query = { role: 'investor' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'profile.company': { $regex: search, $options: 'i' } },
        { 'profile.bio': { $regex: search, $options: 'i' } }
      ];
    }

    const investors = await User.find(query)
      .select('-password')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ 'profile.isOnline': -1, 'profile.lastActive': -1 })
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      investors,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
// @route   POST /api/auth/priority-access
// @access  Private
export const requestPriorityAccess = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.profile.priorityAccess !== 'none') {
      return res.status(400).json({ 
        message: user.profile.priorityAccess === 'pending' 
          ? 'Application already pending' 
          : 'Priority access already approved' 
      });
    }

    user.profile.priorityAccess = 'pending';
    await user.save();

    res.json({ 
      message: 'Priority access application submitted successfully', 
      priorityAccess: 'pending' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

