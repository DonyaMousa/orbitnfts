import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Authentication middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access denied. No token provided.",
    });
  }

  try {
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret_for_development"
    );
    req.user = verified;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).json({
      success: false,
      error: "Invalid token. Please log in again.",
    });
  }
};

// Mock authentication middleware for development/testing
export const bypassAuth = (req, res, next) => {
  // Set a mock user for development
  req.user = {
    id: "test-user-id",
    username: "TestUser",
    address: "0x123456789abcdef",
    email: "test@example.com",
    role: "user",
  };
  next();
};

// Generate a test token for development
export const generateTestToken = () => {
  try {
    const testUser = {
      id: "test-user-id",
      username: "TestUser",
      address: "0x123456789abcdef",
      email: "test@example.com",
      role: "user",
    };

    const token = jwt.sign(
      testUser,
      process.env.JWT_SECRET || "fallback_secret_for_development",
      { expiresIn: "1d" }
    );

    return token;
  } catch (error) {
    console.error("Error generating test token:", error);
    return null;
  }
};
