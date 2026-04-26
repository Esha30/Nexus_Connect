import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import SystemSettings from '../models/SystemSettings.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (req.user) {
        // Check for suspension
        if (req.user.status === 'suspended') {
          return res.status(403).json({ 
            message: 'Your account has been suspended by an administrator.',
            suspended: true 
          });
        }

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

export const checkMaintenance = async (req, res, next) => {
  try {
    const settings = await SystemSettings.findOne();
    
    // If maintenance mode is ON and user is not an admin
    if (settings?.maintenanceMode) {
      // We need to check if the user is an admin. 
      // If req.user exists (from protect), we check role.
      // If not, we check if it's an admin route.
      
      const isAdminRoute = req.originalUrl.startsWith('/api/admin');
      const isAuthRoute = req.originalUrl.startsWith('/api/auth/login') || req.originalUrl.startsWith('/api/auth/google-login');
      
      if (!isAdminRoute && !isAuthRoute) {
        // If user is already authenticated, check if they are admin
        if (req.user && req.user.role === 'admin') {
          return next();
        }
        
        return res.status(503).json({ 
          message: 'System is currently under maintenance. Please try again later.',
          maintenance: true 
        });
      }
    }
    next();
  } catch (error) {
    next(); // Fallback to normal flow if settings can't be fetched
  }
};

export const checkFeatureToggle = (featureName) => {
  return async (req, res, next) => {
    try {
      const settings = await SystemSettings.findOne();
      if (settings && settings.featureToggles && settings.featureToggles[featureName] === false) {
        return res.status(403).json({ 
          message: `The ${featureName} feature is currently disabled by the administrator.`,
          featureDisabled: true 
        });
      }
      next();
    } catch (error) {
      next();
    }
  };
};
