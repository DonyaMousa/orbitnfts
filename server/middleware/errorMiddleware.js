import { logger } from '../utils/logger.js';

// Handle 404 errors
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Handle all other errors
export const errorHandler = (err, req, res, next) => {
  // Set status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  
  // Send error response
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};