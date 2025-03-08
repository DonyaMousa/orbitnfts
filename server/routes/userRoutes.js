// User routes for testing
import express from "express";

const router = express.Router();

// Mock user data
const users = [
  {
    id: "1",
    name: "Test User",
    email: "test@example.com",
    walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    bio: "This is a test user for local development",
    avatar: "https://via.placeholder.com/150",
    createdAt: new Date().toISOString(),
  },
];

// Get all users (for admin purposes)
router.get("/", (req, res) => {
  res.json({ users });
});

// Get user by ID
router.get("/:id", (req, res) => {
  const user = users.find((user) => user.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ user });
});

// Get user by wallet address
router.get("/wallet/:address", (req, res) => {
  const user = users.find(
    (user) =>
      user.walletAddress.toLowerCase() === req.params.address.toLowerCase()
  );
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ user });
});

// Update user profile
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, bio, avatar } = req.body;

  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  const updatedUser = {
    ...users[userIndex],
    name: name || users[userIndex].name,
    bio: bio || users[userIndex].bio,
    avatar: avatar || users[userIndex].avatar,
  };

  users[userIndex] = updatedUser;

  res.json({
    message: "User updated successfully",
    user: updatedUser,
  });
});

export default router;
