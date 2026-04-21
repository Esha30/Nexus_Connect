import mongoose from 'mongoose';

/**
 * Middleware to validate MongoDB ObjectId
 * Prevents server crashes on invalid ID formats
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: `Invalid ID format for parameter: ${paramName}`,
        error: 'INVALID_OBJECT_ID'
      });
    }
    next();
  };
};

export default validateObjectId;
