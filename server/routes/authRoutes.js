// Basic authentication routes for testing
import express from "express";
import jwt from "jsonwebtoken";
import {
  registerWallet,
  getUserProfile,
  updateUserProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import dotenv from "dotenv";
import { authenticateToken, generateTestToken } from "../middleware/auth";

dotenv.config();

const router = express.Router();

// Mock user database for testing
const users = [
  {
    id: "1",
    email: "test@example.com",
    password: "password123", // In production, this would be hashed
    name: "Test User",
  },
];

// Register route
router.post("/register", (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const userExists = users.find((user) => user.email === email);
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const newUser = {
      id: String(users.length + 1),
      email,
      password, // In production, this would be hashed
      name,
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || "test_secret_key",
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Development endpoint to get a test token
router.get("/test-token", (req, res) => {
  // Only allow in development environment
  if (process.env.NODE_ENV !== "production") {
    const token = generateTestToken();

    if (token) {
      return res.status(200).json({
        success: true,
        token,
        message: "Test token generated successfully. For development use only.",
      });
    } else {
      return res.status(500).json({
        success: false,
        error: "Failed to generate test token",
      });
    }
  } else {
    return res.status(403).json({
      success: false,
      error: "This endpoint is only available in development environment",
    });
  }
});

// Mock login endpoint for testing
router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    // For testing, accept any credentials
    // In production, you would validate against a database

    // Create a test user
    const testUser = {
      userId: "user_" + Date.now(),
      walletAddress: "0x" + Math.random().toString(16).substring(2, 42),
      username: email
        ? email.split("@")[0]
        : "User_" + Date.now().toString().substring(7),
      email: email || "test@example.com",
      avatar: `https://api.dicebear.com/6.x/personas/svg?seed=${Date.now()}`,
    };

    // Generate token
    const token = jwt.sign(
      testUser,
      process.env.JWT_SECRET || "fallback_secret_for_development",
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      success: true,
      token,
      data: testUser,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({
      success: false,
      error: "Login failed",
    });
  }
});

// Public routes
router.post("/wallet", registerWallet);
router.get("/profile/:address", getUserProfile);

// Protected routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

export default router;
