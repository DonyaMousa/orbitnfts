import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import xss from "xss-clean";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import csrf from "csurf";
import ExpressBrute from "express-brute";
import { logger } from "../utils/logger.js";
import cors from "cors";

config();

// Rate limiting store
const store = new ExpressBrute.MemoryStore();

// Brute force protection
export const bruteForce = new ExpressBrute(store, {
  freeRetries: 5,
  minWait: 5 * 60 * 1000, // 5 minutes
  maxWait: 60 * 60 * 1000, // 1 hour
  failCallback: (req, res, next, nextValidRequestDate) => {
    logger.warn(`Brute force attempt detected from IP: ${req.ip}`);
    res.status(429).json({
      error: "Too many failed attempts, please try again later",
      nextValidRequestDate,
    });
  },
});

// Basic rate limiter
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});

// More strict rate limiter for sensitive API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests for this endpoint, please try again later.",
});

// Security middleware
export const securityMiddleware = (req, res, next) => {
  // Helmet for secure headers
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production",
    crossOriginEmbedderPolicy: process.env.NODE_ENV === "production",
  })(req, res, () => {
    // CORS configuration
    cors({
      origin:
        process.env.USE_TEST_NETWORK === "true"
          ? "http://localhost:5173"
          : process.env.CORS_WHITELIST?.split(",") || "http://localhost:5173",
      credentials: true,
    })(req, res, next);
  });
};
