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
  process.env.MONGODB_URI || "mongodb://localhost:27017/orbitnfts";

// Define port with fallback options
const PORT = process.env.PORT || 5001;

// In-memory storage as fallback
let useInMemoryOnly = false;
let server = null;

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Set mongoose options to handle connection issues
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      retryWrites: true,
    };

    await mongoose.connect(MONGODB_URI, options);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.log("Falling back to in-memory storage only");
    useInMemoryOnly = true;
    return false;
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
    // Track references to NFTs created and owned by this user
    createdNFTs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NFT",
      },
    ],
    ownedNFTs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NFT",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
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
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
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
      index: true,
    },
    owner: {
      type: String,
      required: true,
      index: true,
    },
    // References to User documents
    creatorRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ownerRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    isAuction: {
      type: Boolean,
      default: false,
    },
    auctionEndTime: {
      type: Date,
    },
    highestBid: {
      type: Number,
    },
    highestBidder: {
      type: String,
    },
    category: {
      type: String,
      default: "Art",
    },
    collection: {
      type: String,
    },
    blockchain: {
      type: String,
      default: "Ethereum",
    },
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    activities: [
      {
        type: {
          type: String,
          enum: ["mint", "transfer", "list", "sell", "bid", "auction"],
        },
        user: {
          type: String,
        },
        price: {
          type: Number,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
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

// Helper function for default avatar URL
const getDefaultAvatar = (address) => {
  return `https://api.dicebear.com/6.x/identicon/svg?seed=${address}`;
};

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

    if (!creator) {
      return res.status(400).json({
        success: false,
        message: "Creator address is required",
      });
    }

    // Generate unique ID
    const tokenId = Math.floor(Math.random() * 1000000).toString();
    console.log(`Generated NFT Token ID: ${tokenId}`);

    if (!useInMemoryOnly) {
      try {
        // Find or create user
        let user = await User.findOne({ address: creator }).catch(() => null);

        if (!user) {
          // Create a new user
          const newUser = new User({
            address: creator,
            username: `User_${creator.substring(0, 6)}`,
            avatarUrl: getDefaultAvatar(creator),
            bio: "NFT enthusiast and collector",
            isVerified: false,
            role: "user",
            createdNFTs: [],
            ownedNFTs: [],
          });

          user = await newUser.save();
          console.log(`Created new user in MongoDB: ${user._id}`);
        }

        // Create the NFT with references to the user
        const nftData = {
          tokenId,
          name,
          description: description || "",
          imageUrl: image,
          metadataUrl: `ipfs://mock-metadata-${tokenId}`,
          creator: creator,
          owner: creator,
          creatorRef: user._id, // Reference to user
          ownerRef: user._id, // Reference to user
          price: parseFloat(price || "0.01"),
          currency: "ETH",
          isListed: true,
          category: category || "Art",
          collection: collection || null,
          likes: 0,
          views: 0,
          blockchain: "Ethereum",
          activities: [
            {
              type: "mint",
              user: creator,
              date: new Date(),
            },
            {
              type: "list",
              user: creator,
              price: parseFloat(price || "0.01"),
              date: new Date(),
            },
          ],
        };

        // Save new NFT
        const nftDoc = new NFT(nftData);
        const savedNFT = await nftDoc.save();
        console.log(`NFT saved to MongoDB with ID: ${savedNFT._id}`);

        // Update user's created and owned NFTs arrays
        user.createdNFTs.push(savedNFT._id);
        user.ownedNFTs.push(savedNFT._id);
        await user.save();
        console.log(`Updated user ${user._id} with new NFT references`);

        // Create response with creator info
        const nftWithCreatorInfo = {
          ...savedNFT.toObject(),
          creatorName: user.username,
          creatorImage: user.avatarUrl,
          creatorIsVerified: user.isVerified,
          ownerName: user.username,
          ownerImage: user.avatarUrl,
          ownerIsVerified: user.isVerified,
        };

        return res.status(201).json({
          success: true,
          message: "NFT created and saved to database with user associations",
          nft: nftWithCreatorInfo,
        });
      } catch (error) {
        console.error(`MongoDB error: ${error.message}`);
        // Continue to fallback
      }
    }

    // Fallback to in-memory storage if MongoDB fails or is disabled
    console.log("Using in-memory storage for NFT creation");

    // Find or create the user in memory
    let memoryUser = users.find(
      (u) => u.address && u.address.toLowerCase() === creator.toLowerCase()
    );

    if (!memoryUser) {
      memoryUser = {
        _id: uuidv4(),
        address: creator,
        username: `User_${creator.substring(0, 6)}`,
        avatarUrl: getDefaultAvatar(creator),
        bio: "NFT enthusiast and collector",
        isVerified: false,
        role: "user",
        createdNFTs: [],
        ownedNFTs: [],
      };
      users.push(memoryUser);
    }

    // Create the NFT in memory
    const fallbackNFT = {
      _id: uuidv4(),
      tokenId,
      name,
      description: description || "",
      imageUrl: image,
      metadataUrl: `ipfs://mock-metadata-${tokenId}`,
      creator: creator,
      owner: creator,
      price: parseFloat(price || "0.01"),
      currency: "ETH",
      isListed: true,
      category: category || "Art",
      collection: collection || null,
      likes: 0,
      views: 0,
      blockchain: "Ethereum",
      createdAt: new Date().toISOString(),
      activities: [
        {
          type: "mint",
          user: creator,
          date: new Date(),
        },
        {
          type: "list",
          user: creator,
          price: parseFloat(price || "0.01"),
          date: new Date(),
        },
      ],
    };

    // Add NFT to in-memory array
    nfts.push(fallbackNFT);
    console.log(`NFT saved to memory with ID: ${fallbackNFT._id}`);

    // Add references to the user's arrays
    if (!memoryUser.createdNFTs) {
      memoryUser.createdNFTs = [];
    }
    if (!memoryUser.ownedNFTs) {
      memoryUser.ownedNFTs = [];
    }

    memoryUser.createdNFTs.push(fallbackNFT._id);
    memoryUser.ownedNFTs.push(fallbackNFT._id);

    // Add creator info to the response
    const nftWithCreatorInfo = {
      ...fallbackNFT,
      creatorName: memoryUser.username,
      creatorImage: memoryUser.avatarUrl,
      creatorIsVerified: memoryUser.isVerified,
      ownerName: memoryUser.username,
      ownerImage: memoryUser.avatarUrl,
      ownerIsVerified: memoryUser.isVerified,
    };

    return res.status(201).json({
      success: true,
      message: "NFT created and saved to memory",
      nft: nftWithCreatorInfo,
    });
  } catch (error) {
    console.error(`Error creating NFT: ${error.message}`);
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

      // Get creator profile info if available
      let creatorProfile = null;
      if (nft.creator) {
        creatorProfile = await User.findOne({
          walletAddress: nft.creator,
        }).catch(() => null);
      }

      // Get owner profile info if available
      let ownerProfile = null;
      if (nft.owner) {
        ownerProfile = await User.findOne({ walletAddress: nft.owner }).catch(
          () => null
        );
      }

      // Merge creator and owner profile info with NFT data
      const nftWithProfileInfo = {
        ...nft.toObject(),
        creatorName: creatorProfile?.username || null,
        creatorImage: creatorProfile?.avatarUrl || null,
        creatorBio: creatorProfile?.bio || null,
        creatorIsVerified: creatorProfile?.isVerified || false,
        ownerName: ownerProfile?.username || null,
        ownerImage: ownerProfile?.avatarUrl || null,
        ownerBio: ownerProfile?.bio || null,
        ownerIsVerified: ownerProfile?.isVerified || false,
      };

      console.log(`NFT found in MongoDB: ${nft.name}`);
      return res.json({
        success: true,
        nft: nftWithProfileInfo,
      });
    } else {
      // Try to find by tokenId in MongoDB
      const nftByTokenId = await NFT.findOne({ tokenId: id }).catch(() => null);

      if (nftByTokenId) {
        // Increment views
        nftByTokenId.views += 1;
        await nftByTokenId.save();

        // Get creator profile info if available
        let creatorProfile = null;
        if (nftByTokenId.creator) {
          creatorProfile = await User.findOne({
            walletAddress: nftByTokenId.creator,
          }).catch(() => null);
        }

        // Get owner profile info if available
        let ownerProfile = null;
        if (nftByTokenId.owner) {
          ownerProfile = await User.findOne({
            walletAddress: nftByTokenId.owner,
          }).catch(() => null);
        }

        // Merge creator and owner profile info with NFT data
        const nftWithProfileInfo = {
          ...nftByTokenId.toObject(),
          creatorName: creatorProfile?.username || null,
          creatorImage: creatorProfile?.avatarUrl || null,
          creatorBio: creatorProfile?.bio || null,
          creatorIsVerified: creatorProfile?.isVerified || false,
          ownerName: ownerProfile?.username || null,
          ownerImage: ownerProfile?.avatarUrl || null,
          ownerBio: ownerProfile?.bio || null,
          ownerIsVerified: ownerProfile?.isVerified || false,
        };

        console.log(`NFT found by tokenId in MongoDB: ${nftByTokenId.name}`);
        return res.json({
          success: true,
          nft: nftWithProfileInfo,
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

    // Get creator profile info if available
    let creatorProfile = null;
    if (memoryNft.creator) {
      creatorProfile = await User.findOne({
        walletAddress: memoryNft.creator,
      }).catch(() => null);
    }

    // Get owner profile info if available
    let ownerProfile = null;
    if (memoryNft.owner) {
      ownerProfile = await User.findOne({
        walletAddress: memoryNft.owner,
      }).catch(() => null);
    }

    // Add creator and owner profile info to NFT data
    const nftWithProfileInfo = {
      ...memoryNft,
      creatorName: creatorProfile?.username || null,
      creatorImage: creatorProfile?.avatarUrl || null,
      creatorBio: creatorProfile?.bio || null,
      creatorIsVerified: creatorProfile?.isVerified || false,
      ownerName: ownerProfile?.username || null,
      ownerImage: ownerProfile?.avatarUrl || null,
      ownerBio: ownerProfile?.bio || null,
      ownerIsVerified: ownerProfile?.isVerified || false,
    };

    console.log(`NFT found in memory: ${memoryNft.name}`);

    return res.json({
      success: true,
      nft: nftWithProfileInfo,
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
    if (!useInMemoryOnly) {
      // First, find the user
      const user = await User.findOne({ address }).catch(() => null);

      if (user) {
        // Populate the user's owned NFTs
        await user.populate("ownedNFTs");

        if (user.ownedNFTs && user.ownedNFTs.length > 0) {
          // Get profile info for these NFTs' creators
          const nftsWithCreatorInfo = await Promise.all(
            user.ownedNFTs.map(async (nft) => {
              // Find creator info if available and not the same as owner
              let creatorProfile = null;
              if (nft.creator && nft.creator !== address) {
                creatorProfile = await User.findOne({
                  address: nft.creator,
                }).catch(() => null);
              }

              // Convert mongoose document to plain object and add creator info
              const nftObject = nft.toObject ? nft.toObject() : nft;
              return {
                ...nftObject,
                creatorName: creatorProfile?.username || null,
                creatorImage: creatorProfile?.avatarUrl || null,
                creatorIsVerified: creatorProfile?.isVerified || false,
                ownerName: user.username,
                ownerImage: user.avatarUrl,
                ownerIsVerified: user.isVerified,
              };
            })
          );

          console.log(
            `Found ${nftsWithCreatorInfo.length} owned NFTs for ${address} using User.ownedNFTs`
          );
          return res.json({
            success: true,
            nfts: nftsWithCreatorInfo,
          });
        }

        // Fallback: direct query on NFT collection
        console.log("User.ownedNFTs empty, falling back to direct NFT query");
      }

      // Direct query on NFT collection if user not found or ownedNFTs empty
      const nfts = await NFT.find({ owner: address }).catch(() => []);

      if (nfts.length > 0) {
        // Get creator profiles for these NFTs
        const nftsWithCreatorInfo = await Promise.all(
          nfts.map(async (nft) => {
            const creatorProfile =
              nft.creator && nft.creator !== address
                ? await User.findOne({ address: nft.creator }).catch(() => null)
                : null;

            const ownerProfile = await User.findOne({ address }).catch(
              () => null
            );

            return {
              ...nft.toObject(),
              creatorName: creatorProfile?.username || null,
              creatorImage: creatorProfile?.avatarUrl || null,
              creatorIsVerified: creatorProfile?.isVerified || false,
              ownerName: ownerProfile?.username || null,
              ownerImage: ownerProfile?.avatarUrl || null,
              ownerIsVerified: ownerProfile?.isVerified || false,
            };
          })
        );

        console.log(
          `Found ${nftsWithCreatorInfo.length} NFTs owned by ${address} via direct NFT query`
        );
        return res.json({
          success: true,
          nfts: nftsWithCreatorInfo,
        });
      }
    }

    // In-memory fallback if MongoDB failed or returned no results
    console.log("Looking for owned NFTs in memory storage");

    // Find the user in memory
    const memoryUser = users.find(
      (u) => u.address && u.address.toLowerCase() === address.toLowerCase()
    );

    // If user has ownedNFTs references, use those
    if (memoryUser && memoryUser.ownedNFTs && memoryUser.ownedNFTs.length > 0) {
      const userOwnedNFTs = memoryUser.ownedNFTs
        .map((nftId) => nfts.find((nft) => nft._id === nftId))
        .filter(Boolean); // Remove any undefined entries

      if (userOwnedNFTs.length > 0) {
        console.log(
          `Found ${userOwnedNFTs.length} owned NFTs via in-memory user references`
        );

        // Add creator and owner info
        const nftsWithCreatorInfo = userOwnedNFTs.map((nft) => {
          const creatorUser = nft.creator
            ? users.find(
                (u) =>
                  u.address &&
                  u.address.toLowerCase() === nft.creator.toLowerCase()
              )
            : null;

          return {
            ...nft,
            creatorName: creatorUser?.username || null,
            creatorImage: creatorUser?.avatarUrl || null,
            creatorIsVerified: creatorUser?.isVerified || false,
            ownerName: memoryUser.username,
            ownerImage: memoryUser.avatarUrl,
            ownerIsVerified: memoryUser.isVerified,
          };
        });

        return res.json({
          success: true,
          nfts: nftsWithCreatorInfo,
        });
      }
    }

    // Direct query on in-memory NFTs
    const memoryNFTs = nfts.filter(
      (nft) => nft.owner && nft.owner.toLowerCase() === address.toLowerCase()
    );

    console.log(
      `Found ${memoryNFTs.length} owned NFTs via direct in-memory search`
    );

    // Add creator info
    const nftsWithInfo = memoryNFTs.map((nft) => {
      const creatorUser = users.find(
        (u) => u.address && u.address.toLowerCase() === address.toLowerCase()
      );

      const ownerUser =
        nft.owner && nft.owner !== address
          ? users.find(
              (u) =>
                u.address && u.address.toLowerCase() === nft.owner.toLowerCase()
            )
          : creatorUser;

      return {
        ...nft,
        creatorName: creatorUser?.username || null,
        creatorImage: creatorUser?.avatarUrl || null,
        creatorIsVerified: creatorUser?.isVerified || false,
        ownerName: ownerUser?.username || creatorUser?.username || null,
        ownerImage: ownerUser?.avatarUrl || creatorUser?.avatarUrl || null,
        ownerIsVerified:
          ownerUser?.isVerified || creatorUser?.isVerified || false,
      };
    });

    return res.json({
      success: true,
      nfts: nftsWithInfo,
    });
  } catch (error) {
    console.error(`Error getting NFTs for owner: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Error fetching NFTs",
      error: error.message,
    });
  }
});

// Get NFTs by creator
app.get("/api/nfts/creator/:address", async (req, res) => {
  const address = req.params.address;
  console.log(`Getting NFTs created by: ${address}`);

  try {
    if (!useInMemoryOnly) {
      // First, find the user
      const user = await User.findOne({ address }).catch(() => null);

      if (user) {
        // Populate the user's created NFTs
        await user.populate("createdNFTs");

        if (user.createdNFTs && user.createdNFTs.length > 0) {
          // For each NFT, find owner info if different from creator
          const nftsWithOwnerInfo = await Promise.all(
            user.createdNFTs.map(async (nft) => {
              // Find owner info if different from creator
              let ownerProfile = null;
              if (nft.owner && nft.owner !== address) {
                ownerProfile = await User.findOne({ address: nft.owner }).catch(
                  () => null
                );
              }

              // Convert mongoose document to plain object and add profile info
              const nftObject = nft.toObject ? nft.toObject() : nft;
              return {
                ...nftObject,
                creatorName: user.username,
                creatorImage: user.avatarUrl,
                creatorIsVerified: user.isVerified,
                ownerName: ownerProfile?.username || user.username,
                ownerImage: ownerProfile?.avatarUrl || user.avatarUrl,
                ownerIsVerified: ownerProfile?.isVerified || user.isVerified,
              };
            })
          );

          console.log(
            `Found ${nftsWithOwnerInfo.length} created NFTs for ${address} using User.createdNFTs`
          );
          return res.json({
            success: true,
            nfts: nftsWithOwnerInfo,
          });
        }

        console.log("User.createdNFTs empty, falling back to direct NFT query");
      }

      // Direct query on NFT collection if user not found or createdNFTs empty
      const nfts = await NFT.find({ creator: address }).catch(() => []);

      if (nfts.length > 0) {
        // Get creator and owner profiles
        const nftsWithOwnerInfo = await Promise.all(
          nfts.map(async (nft) => {
            const ownerProfile =
              nft.owner && nft.owner !== address
                ? await User.findOne({ address: nft.owner }).catch(() => null)
                : null;

            const creatorProfile = await User.findOne({ address }).catch(
              () => null
            );

            return {
              ...nft.toObject(),
              creatorName: creatorProfile?.username || null,
              creatorImage: creatorProfile?.avatarUrl || null,
              creatorIsVerified: creatorProfile?.isVerified || false,
              ownerName:
                ownerProfile?.username || creatorProfile?.username || null,
              ownerImage:
                ownerProfile?.avatarUrl || creatorProfile?.avatarUrl || null,
              ownerIsVerified:
                ownerProfile?.isVerified || creatorProfile?.isVerified || false,
            };
          })
        );

        console.log(
          `Found ${nftsWithOwnerInfo.length} NFTs created by ${address} via direct NFT query`
        );
        return res.json({
          success: true,
          nfts: nftsWithOwnerInfo,
        });
      }
    }

    // In-memory fallback if MongoDB failed or returned no results
    console.log("Looking for created NFTs in memory storage");

    // Find the user in memory
    const memoryUser = users.find(
      (u) => u.address && u.address.toLowerCase() === address.toLowerCase()
    );

    // If user has createdNFTs references, use those
    if (
      memoryUser &&
      memoryUser.createdNFTs &&
      memoryUser.createdNFTs.length > 0
    ) {
      const userCreatedNFTs = memoryUser.createdNFTs
        .map((nftId) => nfts.find((nft) => nft._id === nftId))
        .filter(Boolean); // Remove any undefined entries

      if (userCreatedNFTs.length > 0) {
        console.log(
          `Found ${userCreatedNFTs.length} created NFTs via in-memory user references`
        );

        // Add creator and owner info
        const nftsWithOwnerInfo = userCreatedNFTs.map((nft) => {
          const ownerUser =
            nft.owner && nft.owner !== address
              ? users.find(
                  (u) =>
                    u.address &&
                    u.address.toLowerCase() === nft.owner.toLowerCase()
                )
              : memoryUser;

          return {
            ...nft,
            creatorName: memoryUser.username,
            creatorImage: memoryUser.avatarUrl,
            creatorIsVerified: memoryUser.isVerified,
            ownerName: ownerUser?.username || memoryUser.username,
            ownerImage: ownerUser?.avatarUrl || memoryUser.avatarUrl,
            ownerIsVerified: ownerUser?.isVerified || memoryUser.isVerified,
          };
        });

        return res.json({
          success: true,
          nfts: nftsWithOwnerInfo,
        });
      }
    }

    // Direct query on in-memory NFTs
    const memoryNFTs = nfts.filter(
      (nft) =>
        nft.creator && nft.creator.toLowerCase() === address.toLowerCase()
    );

    console.log(
      `Found ${memoryNFTs.length} created NFTs via direct in-memory search`
    );

    // Add creator and owner info
    const nftsWithInfo = memoryNFTs.map((nft) => {
      const creatorUser = users.find(
        (u) => u.address && u.address.toLowerCase() === address.toLowerCase()
      );

      const ownerUser =
        nft.owner && nft.owner !== address
          ? users.find(
              (u) =>
                u.address && u.address.toLowerCase() === nft.owner.toLowerCase()
            )
          : creatorUser;

      return {
        ...nft,
        creatorName: creatorUser?.username || null,
        creatorImage: creatorUser?.avatarUrl || null,
        creatorIsVerified: creatorUser?.isVerified || false,
        ownerName: ownerUser?.username || creatorUser?.username || null,
        ownerImage: ownerUser?.avatarUrl || creatorUser?.avatarUrl || null,
        ownerIsVerified:
          ownerUser?.isVerified || creatorUser?.isVerified || false,
      };
    });

    return res.json({
      success: true,
      nfts: nftsWithInfo,
    });
  } catch (error) {
    console.error(`Error getting NFTs for creator: ${error.message}`);
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
        avatarUrl: getDefaultAvatar(address),
        bio: "NFT enthusiast and digital art collector.",
        isVerified: Math.random() > 0.8, // 20% chance to be verified
        role: "user",
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
        avatarUrl: getDefaultAvatar(address),
        bio: "NFT enthusiast and digital art collector.",
        isVerified: Math.random() > 0.8, // 20% chance to be verified
        role: "user",
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

// Update user profile
app.post("/api/profile/update", async (req, res) => {
  const { address, name, bio, image } = req.body;

  if (!address) {
    return res.status(400).json({
      success: false,
      message: "Wallet address is required",
    });
  }

  try {
    let user;

    // Only try to use MongoDB if we're not in memory-only mode
    if (!useInMemoryOnly) {
      // Look for user in MongoDB
      user = await User.findOne({ address }).catch(() => null);

      if (user) {
        // Update user fields if provided
        if (name !== undefined) user.username = name;
        if (bio !== undefined) user.bio = bio;
        if (image !== undefined) user.avatarUrl = image;

        // Save user to database
        await user.save();

        console.log(`User profile updated in MongoDB: ${user._id}`);
        return res.status(200).json({
          success: true,
          message: "Profile updated successfully",
          user: {
            _id: user._id,
            address: user.address,
            username: user.username,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
            isVerified: user.isVerified || false,
            role: user.role || "user",
          },
        });
      }
    }

    // If not found in MongoDB or in memory-only mode, update in-memory user
    const userIndex = users.findIndex(
      (u) => u.address.toLowerCase() === address.toLowerCase()
    );

    if (userIndex === -1) {
      // Create new user if not found
      const newUser = {
        _id: uuidv4(),
        address,
        username: name || address.substring(0, 8),
        bio: bio || "",
        avatarUrl: image || getDefaultAvatar(address),
        isVerified: Math.random() > 0.8, // 20% chance to be verified
        role: "user",
      };

      users.push(newUser);
      console.log(`New user created in memory: ${newUser._id}`);

      return res.status(200).json({
        success: true,
        message: "Profile created successfully",
        user: newUser,
      });
    }

    // Update existing in-memory user
    users[userIndex] = {
      ...users[userIndex],
      username: name || users[userIndex].username,
      bio: bio !== undefined ? bio : users[userIndex].bio,
      avatarUrl: image || users[userIndex].avatarUrl,
    };

    console.log(`User profile updated in memory: ${users[userIndex]._id}`);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: users[userIndex],
    });
  } catch (error) {
    console.error(`Error updating profile: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
});

// Get user profile by address
app.get("/api/profile/:address", async (req, res) => {
  const address = req.params.address;
  console.log(`Getting profile for address: ${address}`);

  try {
    // Try to find in MongoDB first
    if (!useInMemoryOnly) {
      const user = await User.findOne({ address }).catch(() => null);

      if (user) {
        console.log(`User found in MongoDB: ${user._id}`);
        return res.status(200).json({
          success: true,
          user: {
            _id: user._id,
            address: user.address,
            username: user.username,
            avatarUrl: user.avatarUrl,
            bio: user.bio || "",
            isVerified: user.isVerified || false,
            role: user.role || "user",
          },
        });
      }
    }

    // If not found in MongoDB or in memory-only mode, try in-memory
    const memoryUser = users.find(
      (u) => u.address && u.address.toLowerCase() === address.toLowerCase()
    );

    if (!memoryUser) {
      // Create a default user if not found
      const newUser = {
        _id: uuidv4(),
        address,
        username: `User_${address.substring(0, 6)}`,
        avatarUrl: getDefaultAvatar(address),
        bio: "NFT enthusiast and collector",
        isVerified: false,
        role: "user",
      };

      // Add to memory array
      users.push(newUser);

      console.log(`New user created in memory: ${newUser._id}`);
      return res.status(200).json({
        success: true,
        user: newUser,
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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    mode: useInMemoryOnly ? "in-memory" : "mongo-connected",
    port: server && server.address() ? server.address().port : process.env.PORT,
  });
});

// Get all NFTs
app.get("/api/nfts", async (req, res) => {
  try {
    console.log("Getting all NFTs");

    // Try to find in MongoDB first
    let nfts = [];
    if (!useInMemoryOnly) {
      nfts = await NFT.find({})
        .limit(100)
        .catch(() => []);

      if (nfts.length > 0) {
        // Get creator profiles for these NFTs
        const nftsWithCreatorInfo = await Promise.all(
          nfts.map(async (nft) => {
            const creatorProfile = nft.creator
              ? await User.findOne({ walletAddress: nft.creator }).catch(
                  () => null
                )
              : null;

            const ownerProfile = nft.owner
              ? await User.findOne({ walletAddress: nft.owner }).catch(
                  () => null
                )
              : null;

            return {
              ...nft.toObject(),
              creatorName: creatorProfile?.username || null,
              creatorImage: creatorProfile?.avatarUrl || null,
              creatorIsVerified: creatorProfile?.isVerified || false,
              ownerName: ownerProfile?.username || null,
              ownerImage: ownerProfile?.avatarUrl || null,
              ownerIsVerified: ownerProfile?.isVerified || false,
            };
          })
        );

        console.log(`Found ${nftsWithCreatorInfo.length} NFTs in MongoDB`);
        return res.json({
          success: true,
          nfts: nftsWithCreatorInfo,
        });
      }
    }

    // If not found in MongoDB or in memory-only mode, use in-memory data
    console.log(`Using in-memory NFTs (${nfts.length} items)`);
    return res.json({
      success: true,
      nfts: nfts,
    });
  } catch (error) {
    console.error(`Error getting all NFTs: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Error fetching NFTs",
      error: error.message,
    });
  }
});

// Start the server
const startServer = async (port = PORT, retryCount = 0) => {
  try {
    // Connect to MongoDB (only if we're not already in in-memory mode)
    if (!useInMemoryOnly) {
      const dbConnected = await connectDB();
      if (!dbConnected) {
        console.log("Server will operate with in-memory storage only");
      }
    }

    // Create server but don't start listening yet
    server = app.listen(port);

    // Handle server errors before it's started
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        const newPort = parseInt(port) + 1;
        console.log(`Port ${port} is in use, trying port ${newPort}...`);

        // Try with a new port (max 5 retries)
        if (retryCount < 5) {
          server = null;
          startServer(newPort, retryCount + 1);
        } else {
          console.error(
            "Failed to find an available port after multiple attempts."
          );
          process.exit(1);
        }
      } else {
        console.error(`Server error: ${error.message}`);
        process.exit(1);
      }
    });

    // Once server is listening successfully
    server.on("listening", () => {
      const actualPort = server.address().port;
      console.log(`Test server running on port ${actualPort}`);
      console.log(`Test API available at: http://localhost:${actualPort}`);
      if (useInMemoryOnly) {
        console.log(
          "WARNING: Using in-memory storage only - data will not persist between restarts"
        );
      }

      // Update the app's environment with the actual port
      process.env.PORT = actualPort;
    });
  } catch (error) {
    console.error(`Server error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
