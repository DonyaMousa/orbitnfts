// Basic authentication routes for testing
import express from "express";
import jwt from "jsonwebtoken";
import {
  registerWallet,
  getUserProfile,
  updateUserProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

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

// Login route
router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find((user) => user.email === email);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "test_secret_key",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Public routes
router.post("/wallet", registerWallet);
router.get("/profile/:address", getUserProfile);

// Protected routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

export default router;
