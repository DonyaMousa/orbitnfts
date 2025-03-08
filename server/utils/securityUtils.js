import crypto from 'crypto';
import { logger } from './logger.js';

export const securityUtils = {
  // Generate secure random string
  generateSecureToken: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  },

  // Generate secure password hash
  hashPassword: async (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) {
          logger.error('Password hashing error:', err);
          reject(err);
        }
        resolve(salt + ':' + derivedKey.toString('hex'));
      });
    });
  },

  // Verify password hash
  verifyPassword: async (password, hash) => {
    return new Promise((resolve, reject) => {
      const [salt, key] = hash.split(':');
      crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) {
          logger.error('Password verification error:', err);
          reject(err);
        }
        resolve(key === derivedKey.toString('hex'));
      });
    });
  },

  // Generate secure session ID
  generateSessionId: () => {
    return crypto.randomBytes(32).toString('base64');
  },

  // Encrypt sensitive data
  encryptData: (data, key = process.env.ENCRYPTION_KEY) => {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag();
      return {
        iv: iv.toString('hex'),
        encryptedData: encrypted,
        authTag: authTag.toString('hex')
      };
    } catch (error) {
      logger.error('Data encryption error:', error);
      throw new Error('Encryption failed');
    }
  },

  // Decrypt sensitive data
  decryptData: (encryptedData, key = process.env.ENCRYPTION_KEY) => {
    try {
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        Buffer.from(key, 'hex'),
        Buffer.from(encryptedData.iv, 'hex')
      );
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted);
    } catch (error) {
      logger.error('Data decryption error:', error);
      throw new Error('Decryption failed');
    }
  },

  // Sanitize user input
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  // Generate secure nonce
  generateNonce: () => {
    return crypto.randomBytes(16).toString('base64');
  },

  // Validate JWT token
  validateJWT: (token, secret = process.env.JWT_SECRET) => {
    try {
      const decoded = jwt.verify(token, secret);
      return {
        valid: true,
        decoded
      };
    } catch (error) {
      logger.error('JWT validation error:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  },

  // Check for common security vulnerabilities
  checkVulnerabilities: (req) => {
    const vulnerabilities = [];

    // Check for missing security headers
    const requiredHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
      'Content-Security-Policy'
    ];

    requiredHeaders.forEach(header => {
      if (!req.headers[header.toLowerCase()]) {
        vulnerabilities.push(`Missing security header: ${header}`);
      }
    });

    // Check for insecure protocols
    if (req.protocol !== 'https' && process.env.NODE_ENV === 'production') {
      vulnerabilities.push('Insecure protocol (HTTP) in production');
    }

    // Check for suspicious query parameters
    const suspiciousParams = ['eval', 'exec', 'script', 'alert'];
    Object.keys(req.query).forEach(key => {
      if (suspiciousParams.some(param => req.query[key].includes(param))) {
        vulnerabilities.push('Suspicious query parameter detected');
      }
    });

    return vulnerabilities;
  }
};