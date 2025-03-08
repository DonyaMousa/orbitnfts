// Simple Express server for testing - no dependencies on other modules
import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

// Load environment variables
config();

// Create Express app
const app = express();

// Enable CORS for all routes
app.use(
  cors({
    origin: "*", // Allow any origin for testing
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON bodies
app.use(express.json({ limit: "50mb" }));

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://donyamousa:$orbitnfts@orbitnfts.0gtw2.mongodb.net/?retryWrites=true&w=majority&appName=orbitnfts";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Define MongoDB schemas
const userSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
    bio: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

const nftSchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    metadataUrl: {
      type: String,
    },
    creator: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "ETH",
    },
    isListed: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      default: "Art",
    },
    collection: {
      type: String,
    },
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    attributes: [
      {
        trait_type: String,
        value: String,
        rarity: Number,
      },
    ],
    activities: [
      {
        type: {
          type: String,
          enum: ["Mint", "Listing", "Sale", "Transfer", "Bid"],
        },
        user: String,
        price: Number,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create MongoDB models
const User = mongoose.model("User", userSchema);
const NFT = mongoose.model("NFT", nftSchema);

// Global storage for mock data (used as fallback)
const nfts = [
  // Sample NFTs to ensure we always have data to display
  {
    _id: "sample-nft-1",
    tokenId: "1001",
    name: "Abstract Dimensions",
    description: "An exploration of form, color, and texture in digital space.",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    metadataUrl: "ipfs://mock-metadata-url",
    creator: "0x96acdd1b1eb64f311505d691026c6df5ab75006e",
    owner: "0x96acdd1b1eb64f311505d691026c6df5ab75006e",
    price: 0.75,
    currency: "ETH",
    isListed: true,
    category: "Art",
    collection: "Digital Abstracts",
    likes: 42,
    views: 128,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attributes: [
      { trait_type: "Style", value: "Abstract" },
      { trait_type: "Dominant Color", value: "Blue" },
      { trait_type: "Rarity", value: "Uncommon" },
    ],
    activities: [
      {
        id: "act1",
        type: "Mint",
        user: "0x96acdd1b1eb64f311505d691026c6df5ab75006e",
        date: new Date().toISOString(),
      },
      {
        id: "act2",
        type: "Listing",
        user: "0x96acdd1b1eb64f311505d691026c6df5ab75006e",
        price: 0.75,
        date: new Date().toISOString(),
      },
    ],
  },
  {
    _id: "sample-nft-2",
    tokenId: "1002",
    name: "Digital Dreamscape",
    description:
      "A surreal landscape that blends natural elements with digital artifacts.",
    imageUrl:
      "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    metadataUrl: "ipfs://mock-metadata-url",
    creator: "0x96acdd1b1eb64f311505d691026c6df5ab75006e",
    owner: "0x96acdd1b1eb64f311505d691026c6df5ab75006e",
    price: 1.2,
    currency: "ETH",
    isListed: true,
    category: "Photography",
    collection: "Digital Dreams",
    likes: 28,
    views: 96,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attributes: [
      { trait_type: "Style", value: "Surrealism" },
      { trait_type: "Dominant Color", value: "Purple" },
      { trait_type: "Rarity", value: "Rare" },
    ],
    activities: [
      {
        id: "act3",
        type: "Mint",
        user: "0x96acdd1b1eb64f311505d691026c6df5ab75006e",
        date: new Date().toISOString(),
      },
      {
        id: "act4",
        type: "Listing",
        user: "0x96acdd1b1eb64f311505d691026c6df5ab75006e",
        price: 1.2,
        date: new Date().toISOString(),
      },
    ],
  },
];
const users = [];

// Root route
app.get("/", (req, res) => {
  res.json({
    status: "API is running in test mode",
  });
});

// Mint NFT endpoint
app.post("/api/nfts/mint", async (req, res) => {
  try {
    const { name, description, image, price, category, collection } = req.body;
    // Get creator address from authorization header or request body
    const creator = req.headers.authorization
      ? req.headers.authorization.split(" ")[1] // Try to get from token
      : req.body.creator || req.query.address; // Fallback to body or query param

    console.log(`Creating NFT: ${name} by ${creator}`);

    // Simple validation
    if (!name || !image) {
      return res.status(400).json({
        success: false,
        message: "Name and image are required",
      });
    }

    // Generate unique ID
    const tokenId = Math.floor(Math.random() * 1000000).toString();

    console.log(`Generated NFT Token ID: ${tokenId}`);

    // Create a new NFT
    const newNFT = {
      tokenId,
      name,
      description: description || "",
      imageUrl: image,
      metadataUrl: "ipfs://mock-metadata-url",
      creator: creator || "0x96acdd1b1eb64f311505d691026c6df5ab75006e",
      owner: creator || "0x96acdd1b1eb64f311505d691026c6df5ab75006e",
      price: parseFloat(price || "0.01"),
      currency: "ETH",
      isListed: true,
      category: category || "Art",
      collection: collection || null,
      likes: 0,
      views: 0,
      attributes: [],
      activities: [
        {
          type: "Mint",
          user: creator || "0x96acdd1b1eb64f311505d691026c6df5ab75006e",
          date: new Date(),
        },
        {
          type: "Listing",
          user: creator || "0x96acdd1b1eb64f311505d691026c6df5ab75006e",
          price: parseFloat(price || "0.01"),
          date: new Date(),
        },
      ],
    };

    try {
      // Try to save to MongoDB
      const nftDoc = new NFT(newNFT);
      const savedNFT = await nftDoc.save();
      console.log(`NFT saved to MongoDB with ID: ${savedNFT._id}`);

      // Return the saved NFT
      return res.status(201).json({
        success: true,
        message: "NFT created and saved to database",
        nft: savedNFT,
      });
    } catch (dbError) {
      console.error("Error saving NFT to database:", dbError);

      // Fallback to in-memory storage
      const fallbackNFT = { _id: uuidv4(), ...newNFT };
      nfts.push(fallbackNFT);
      console.log(`Fallback: NFT saved to memory with ID: ${fallbackNFT._id}`);

      return res.status(201).json({
        success: true,
        message: "NFT created (fallback to in-memory storage)",
        nft: fallbackNFT,
      });
    }
  } catch (error) {
    console.error("Error creating NFT:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create NFT",
      error: error.message,
    });
  }
});

// Get NFT by ID endpoint
app.get("/api/nfts/:id", async (req, res) => {
  const id = req.params.id;
  console.log(`Getting NFT by ID: ${id}`);

  try {
    // Try to find in MongoDB first
    const nft = await NFT.findById(id).catch(() => null);

    if (nft) {
      // Increment views
      nft.views += 1;
      await nft.save();

      console.log(`NFT found in MongoDB: ${nft.name}`);
      return res.json({
        success: true,
        nft,
      });
    } else {
      // Try to find by tokenId in MongoDB
      const nftByTokenId = await NFT.findOne({ tokenId: id }).catch(() => null);

      if (nftByTokenId) {
        // Increment views
        nftByTokenId.views += 1;
        await nftByTokenId.save();

        console.log(`NFT found by tokenId in MongoDB: ${nftByTokenId.name}`);
        return res.json({
          success: true,
          nft: nftByTokenId,
        });
      }
    }

    // If not found in MongoDB, try in-memory
    console.log("NFT not found in MongoDB, checking in-memory storage");
    const memoryNft = nfts.find(
      (n) =>
        n._id.toLowerCase() === id.toLowerCase() ||
        n.tokenId.toLowerCase() === id.toLowerCase()
    );

    if (!memoryNft) {
      console.log(`NFT not found with ID: ${id}`);
      console.log(
        `Available NFTs in memory: ${nfts.map((n) => n._id).join(", ")}`
      );
      return res.status(404).json({
        success: false,
        message: "NFT not found",
      });
    }

    // Increment views
    memoryNft.views += 1;
    console.log(`NFT found in memory: ${memoryNft.name}`);

    return res.json({
      success: true,
      nft: memoryNft,
    });
  } catch (error) {
    console.error(`Error getting NFT by ID: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Error fetching NFT",
      error: error.message,
    });
  }
});

// Get NFTs by owner
app.get("/api/nfts/owner/:address", async (req, res) => {
  const address = req.params.address;
  console.log(`Getting NFTs for owner: ${address}`);

  try {
    // Try to find in MongoDB first
    const dbNfts = await NFT.find({ owner: address }).catch(() => []);

    if (dbNfts.length > 0) {
      console.log(
        `Found ${dbNfts.length} NFTs in MongoDB for owner: ${address}`
      );
      return res.json({
        success: true,
        count: dbNfts.length,
        nfts: dbNfts,
      });
    }

    // If none found in MongoDB, use in-memory
    console.log("No NFTs found in MongoDB, using in-memory data");
    const memoryNfts = nfts.filter(
      (nft) => nft.owner.toLowerCase() === address.toLowerCase()
    );

    return res.json({
      success: true,
      count: memoryNfts.length,
      nfts: memoryNfts,
    });
  } catch (error) {
    console.error(`Error getting NFTs by owner: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Error fetching NFTs",
      error: error.message,
    });
  }
});

// Get NFTs created by a user
app.get("/api/nfts/creator/:address", async (req, res) => {
  const address = req.params.address;
  console.log(`Getting NFTs created by: ${address}`);

  try {
    // Try to find in MongoDB first
    const dbNfts = await NFT.find({ creator: address }).catch(() => []);

    if (dbNfts.length > 0) {
      console.log(
        `Found ${dbNfts.length} NFTs in MongoDB created by: ${address}`
      );
      return res.json({
        success: true,
        count: dbNfts.length,
        nfts: dbNfts,
      });
    }

    // If none found in MongoDB, use in-memory
    console.log("No NFTs found in MongoDB, using in-memory data");
    const memoryNfts = nfts.filter(
      (nft) => nft.creator.toLowerCase() === address.toLowerCase()
    );

    return res.json({
      success: true,
      count: memoryNfts.length,
      nfts: memoryNfts,
    });
  } catch (error) {
    console.error(`Error getting NFTs by creator: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Error fetching NFTs",
      error: error.message,
    });
  }
});

// Wallet authentication endpoint
app.post("/api/auth/wallet", async (req, res) => {
  const { address } = req.body;
  console.log(`Authenticating wallet: ${address}`);

  if (!address) {
    return res.status(400).json({
      success: false,
      message: "Wallet address is required",
    });
  }

  try {
    // Check if user exists in MongoDB
    let user = await User.findOne({ address }).catch(() => null);

    if (!user) {
      console.log(`Creating new user in MongoDB for address: ${address}`);
      // Create new user
      const newUser = new User({
        address,
        username: `User_${address.substring(0, 6)}`,
        avatarUrl: `https://avatars.dicebear.com/api/identicon/${address}.svg`,
        bio: "NFT enthusiast and digital art collector.",
        isVerified: false,
      });

      user = await newUser.save().catch((err) => {
        console.error("Error saving user to MongoDB:", err);
        return null;
      });
    }

    if (user) {
      console.log(`User authenticated from MongoDB: ${user._id}`);
      // Generate JWT token (in a real app)
      const token = uuidv4();

      return res.json({
        success: true,
        token,
        user,
      });
    }

    // Fallback to in-memory if MongoDB fails
    console.log("Falling back to in-memory user storage");
    let memoryUser = users.find(
      (u) => u.address && u.address.toLowerCase() === address.toLowerCase()
    );

    if (!memoryUser) {
      memoryUser = {
        _id: uuidv4(),
        address,
        username: `User_${address.substring(0, 6)}`,
        avatarUrl: `https://avatars.dicebear.com/api/identicon/${address}.svg`,
        bio: "NFT enthusiast and digital art collector.",
        isVerified: false,
        createdAt: new Date().toISOString(),
      };
      users.push(memoryUser);
    }

    const token = uuidv4();

    return res.json({
      success: true,
      token,
      user: memoryUser,
    });
  } catch (error) {
    console.error(`Wallet authentication error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
});

// Profile update endpoint
app.post("/api/profile/update", async (req, res) => {
  try {
    console.log("Profile update request received");
    const { name, bio, image, address } = req.body;

    if (!address) {
      console.log("Profile update failed: No address provided");
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    console.log(`Updating profile for address: ${address}`);

    try {
      // Try to find user in MongoDB
      let user = await User.findOne({ address }).catch(() => null);

      if (!user) {
        console.log("User not found in MongoDB, creating new user");
        // Create new user
        const newUser = new User({
          address,
          username: name || `User_${address.substring(0, 6)}`,
          avatarUrl:
            image ||
            `https://avatars.dicebear.com/api/identicon/${address}.svg`,
          bio: bio || "NFT enthusiast and digital art collector.",
          isVerified: false,
        });

        user = await newUser.save();
        console.log(`New user created in MongoDB: ${user._id}`);
      } else {
        console.log("User found in MongoDB, updating existing user");
        // Update existing user
        if (name) user.username = name;
        if (bio !== undefined) user.bio = bio;
        if (image !== undefined) user.avatarUrl = image;

        await user.save();
        console.log(`User updated in MongoDB: ${user._id}`);
      }

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully in MongoDB",
        user,
      });
    } catch (dbError) {
      console.error("MongoDB update failed:", dbError);
      console.log("Falling back to in-memory storage");

      // Fallback to in-memory storage
      let user = users.find(
        (u) => u.address && u.address.toLowerCase() === address.toLowerCase()
      );

      if (!user) {
        console.log("User not found in memory, creating new user");
        // Create new user
        user = {
          _id: uuidv4(),
          address,
          username: name || `User_${address.substring(0, 6)}`,
          avatarUrl:
            image ||
            `https://avatars.dicebear.com/api/identicon/${address}.svg`,
          bio: bio || "NFT enthusiast and digital art collector.",
          isVerified: false,
          createdAt: new Date().toISOString(),
        };
        users.push(user);
        console.log("New user created in memory");
      } else {
        console.log("User found in memory, updating existing user");
        // Update existing user
        const userIndex = users.findIndex(
          (u) => u.address && u.address.toLowerCase() === address.toLowerCase()
        );

        // Check if the image is a data URL (too large for console output)
        const logSafeImage =
          image && image.length > 100
            ? `[Data URL length: ${image.length}]`
            : image;

        console.log("Update data:", {
          name,
          bio,
          image: logSafeImage,
          currentUsername: user.username,
          currentBio: user.bio,
        });

        users[userIndex] = {
          ...user,
          username: name || user.username,
          avatarUrl: image || user.avatarUrl,
          bio: bio || user.bio,
          updatedAt: new Date().toISOString(),
        };
        user = users[userIndex];
        console.log("User updated in memory");
      }

      console.log("Final user object:", {
        _id: user._id,
        address: user.address,
        username: user.username,
        bio: user.bio,
        isVerified: user.isVerified,
      });

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully in memory",
        user,
      });
    }
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
});

// Get user profile endpoint
app.get("/api/profile/:address", async (req, res) => {
  const { address } = req.params;
  console.log(`Getting profile for address: ${address}`);

  try {
    // Try to find user in MongoDB
    const user = await User.findOne({ address }).catch(() => null);

    if (user) {
      console.log(`User found in MongoDB: ${user._id}`);
      return res.status(200).json({
        success: true,
        user,
      });
    }

    // If not found in MongoDB, try in-memory
    console.log("User not found in MongoDB, checking in-memory storage");
    const memoryUser = users.find(
      (u) => u.address && u.address.toLowerCase() === address.toLowerCase()
    );

    if (!memoryUser) {
      console.log(`User not found with address: ${address}`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log(`User found in memory: ${memoryUser._id}`);

    return res.status(200).json({
      success: true,
      user: memoryUser,
    });
  } catch (error) {
    console.error(`Error getting user profile: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: error.message,
    });
  }
});

// Start the server
const PORT = process.env.PORT || 5002;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
      console.log(`Test API available at: http://localhost:${PORT}`);
    });
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      console.warn(`Port ${PORT} is in use, trying ${Number(PORT) + 1}`);
      process.env.PORT = String(Number(PORT) + 1);
      startServer();
    } else {
      console.error(`Error starting server: ${error.message}`);
    }
  }
};

startServer();
