import { body, validationResult } from 'express-validator';
import sanitizeHtml from 'sanitize-html';
import { logger } from '../utils/logger.js';

// Sanitize HTML content
const sanitizeContent = (content) => {
  return sanitizeHtml(content, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a'],
    allowedAttributes: {
      'a': ['href']
    }
  });
};

// Common validation rules
export const commonValidationRules = {
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .escape()
    .withMessage('Name must be between 2 and 50 characters'),
    
  email: body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
    
  password: body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must be at least 8 characters and contain uppercase, lowercase, number and special character'),
    
  description: body('description')
    .trim()
    .isLength({ max: 1000 })
    .customSanitizer(value => sanitizeContent(value))
    .withMessage('Description cannot exceed 1000 characters'),
    
  price: body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
};

// NFT validation rules
export const nftValidationRules = [
  commonValidationRules.name,
  commonValidationRules.description,
  commonValidationRules.price,
  body('tokenId').isString().trim().escape(),
  body('collection').isString().trim().escape(),
  body('category').isIn(['Art', 'Collectibles', 'Music', 'Photography', 'Sports', 'Utility', 'Virtual Worlds']),
];

// User validation rules
export const userValidationRules = [
  commonValidationRules.name,
  commonValidationRules.email,
  commonValidationRules.password,
  body('role').optional().isIn(['user', 'admin']),
];

// Validation middleware
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation error:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// XSS Prevention middleware
export const preventXSS = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key]);
      }
    });
  }
  next();
};

// SQL Injection Prevention middleware
export const preventSQLInjection = (req, res, next) => {
  const sqlInjectionPattern = /('|"|;|--|\/\*|\*\/|xp_|sp_|exec|execute|insert|select|delete|update|drop|union|into|load_file|outfile)/i;
  
  const checkValue = (value) => {
    if (typeof value === 'string' && sqlInjectionPattern.test(value)) {
      logger.warn('Potential SQL injection attempt detected:', {
        value,
        ip: req.ip,
        path: req.path
      });
      return true;
    }
    return false;
  };

  const hasInjection = Object.values(req.body).some(checkValue) || 
                      Object.values(req.query).some(checkValue) || 
                      Object.values(req.params).some(checkValue);

  if (hasInjection) {
    return res.status(403).json({ 
      error: 'Invalid input detected' 
    });
  }

  next();
};

// File upload validation middleware
export const validateFileUpload = (req, res, next) => {
  if (!req.files) {
    return next();
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  Object.values(req.files).forEach(file => {
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'
      });
    }

    if (file.size > maxSize) {
      return res.status(400).json({
        error: 'File size too large. Maximum size is 5MB.'
      });
    }
  });

  next();
};