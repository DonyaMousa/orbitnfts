import { User } from "../models/index.js";
import { generateToken } from "../utils/encryption.js";
import { logger } from "../utils/logger.js";
import mongoose from "mongoose";

// Register or login a user with wallet address
export const registerWallet = async (req, res) => {
  try {
    const { address, signature } = req.body;

    if (!address) {
      return res.status(400).json({ message: "Please provide wallet address" });
    }

    // For test mode, create a mock user
    if (process.env.USE_TEST_NETWORK === "true") {
      logger.info(`Test mode: Registering wallet ${address}`);

      // Create a mock user response
      const mockUser = {
        _id: "test-user-id",
        walletAddress: address,
        username: `User_${address.slice(0, 6)}`,
        avatarUrl: `https://avatars.dicebear.com/api/identicon/${address}.svg`,
        bio: "NFT enthusiast exploring the blockchain space.",
        isVerified: false,
      };

      // Generate token
      const token = generateToken(mockUser._id);

      return res.status(200).json({
        success: true,
        token,
        user: mockUser,
      });
    }

    // Check if user exists
    let user = await User.findOne({ walletAddress: address });

    // If user doesn't exist, create new user
    if (!user) {
      user = new User({
        walletAddress: address,
        username: `User_${address.slice(0, 6)}`, // Generate default username
        avatarUrl: `https://avatars.dicebear.com/api/identicon/${address}.svg`, // Add default avatar
        bio: "NFT enthusiast exploring the blockchain space.", // Add default bio
        nonce: Math.floor(Math.random() * 1000000), // Generate random nonce for future authentication
      });

      await user.save();
      logger.info(`New user registered with wallet: ${address}`);
    } else {
      logger.info(`Existing user logged in with wallet: ${address}`);
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data and token
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        isVerified: user.isVerified,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error(`Auth error: ${error.message}`);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    // For test mode, return a mock profile
    if (process.env.USE_TEST_NETWORK === "true") {
      const { address } = req.params;
      logger.info(
        `Test mode: Fetching profile for wallet ${address || req.user?.walletAddress}`
      );

      return res.status(200).json({
        success: true,
        user: {
          _id: "test-user-id",
          walletAddress: address || req.user?.walletAddress,
          username: `User_${(address || req.user?.walletAddress).slice(0, 6)}`,
          avatarUrl: `https://avatars.dicebear.com/api/identicon/${address || req.user?.walletAddress}.svg`,
          bio: "NFT enthusiast exploring the blockchain space.",
          isVerified: false,
          role: "user",
        },
      });
    }

    const userId = req.params.id || req.user?._id;
    const walletAddress = req.params.address;

    let user;

    if (walletAddress) {
      // If wallet address is provided, find by wallet address
      user = await User.findOne({ walletAddress });
    } else if (userId) {
      // If user ID is provided, find by ID
      user = await User.findById(userId);
    } else {
      return res.status(400).json({
        success: false,
        message: "User ID or wallet address required",
      });
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        isVerified: user.isVerified,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    logger.error(`Error getting user profile: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
      error: error.message,
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    // For test mode, return a mock updated profile
    if (process.env.USE_TEST_NETWORK === "true") {
      const { username, bio, avatarUrl } = req.body;
      logger.info(`Test mode: Updating profile`);

      return res.status(200).json({
        success: true,
        user: {
          _id: "test-user-id",
          walletAddress: req.user?.walletAddress,
          username: username || `User_${req.user?.walletAddress.slice(0, 6)}`,
          avatarUrl:
            avatarUrl ||
            `https://avatars.dicebear.com/api/identicon/${req.user?.walletAddress}.svg`,
          bio: bio || "NFT enthusiast exploring the blockchain space.",
          isVerified: false,
          role: "user",
        },
      });
    }

    const userId = req.user?._id || req.params.id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    let user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if this is the user's own profile
    if (
      req.user &&
      req.user._id.toString() !== user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update this profile",
        });
    }

    // Update user fields if provided
    const { username, email, bio, avatarUrl } = req.body;

    if (username) user.username = username;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    // Save the updated user
    await user.save();
    logger.info(`Profile updated for user: ${user._id}`);

    // Return updated user data
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error(`Error updating profile: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};
