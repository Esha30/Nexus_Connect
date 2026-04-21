import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ errors: errors.array() });
};

export const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['investor', 'entrepreneur']).withMessage('Role must be either investor or entrepreneur'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const meetingValidation = [
  body('participants').isArray({ min: 1 }).withMessage('At least one participant is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
];

export const paymentValidation = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('type').isIn(['deposit', 'transfer', 'withdraw']).withMessage('Invalid transaction type'),
];
