import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { logger } from "../utils/logger.js";
import { encryption } from "../utils/encryption.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-for-jwt";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "30d";

export const protect = async (req, res, next) => {
  // For local testing with the USE_TEST_NETWORK flag, we'll skip authentication
  if (process.env.USE_TEST_NETWORK === "true") {
    logger.info("Using test authentication");
    req.user = {
      _id: "test-user-id",
      email: "test@example.com",
      username: "Test User",
      walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      role: "user"
    };
    return next();
  }

  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Find user by ID
      const user = await User.findById(decoded.id).select("-password");
      
      if (!user) {
        logger.error("User not found for token");
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      logger.error(`Authentication error: ${error.message}`);
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  } else if (!token) {
    logger.error("No token provided");
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.id);

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  // Remove sensitive data
  const sanitizedUser = { ...user };
  delete sanitizedUser.password;
  delete sanitizedUser.password_changed_at;

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user: sanitizedUser,
  });
};
