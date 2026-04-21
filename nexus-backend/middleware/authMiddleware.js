import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (req.user) {
        // Update presence efficiently without triggering full document validation
        User.updateOne(
          { _id: req.user._id },
          { $set: { 'profile.isOnline': true, 'profile.lastActive': new Date() } }
        ).catch(() => {}); // Fire-and-forget, don't block the request
        return next();
      } else {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
    } catch (error) {
      console.error(`[AUTH_FAIL] Token failed for ${req.originalUrl}:`, error.message);
      return res.status(401).json({ message: 'Not authorized, token failed', reason: error.message });
    }
  }

  if (!token) {
    console.warn(`[AUTH_FAIL] No token provided for ${req.originalUrl}`);
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
