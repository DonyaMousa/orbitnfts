import { ethers } from "ethers";
import { uploadToIPFS, uploadMetadataToIPFS } from "../utils/ipfs.js";
import { nftMarketContract, provider, isTestMode } from "../config/web3.js";
import { NFT, Collection, User } from "../models/index.js";
import { logger } from "../utils/logger.js";
import mongoose from "mongoose";

// Helper function to generate a fake IPFS URL for testing
const generateMockIPFSUrl = (content) => {
  const hash = Math.random().toString(36).substring(2, 15);
  return `ipfs://mock-ipfs-hash-${hash}`;
};

// Mint a new NFT
export const mintNFT = async (req, res) => {
  try {
    const { name, description, image, price, collection, category } = req.body;

    // Simple validation
    if (!name || !image || !price) {
      return res
        .status(400)
        .json({ message: "Please provide name, image, and price" });
    }

    // Generate a unique token ID
    const tokenId = Math.floor(Math.random() * 1000000).toString();

    // Create metadata URL (in a real app this would be on IPFS)
    const metadataUrl = generateMockIPFSUrl(
      JSON.stringify({
        name,
        description,
        image,
      })
    );

    // For test mode, create a simple NFT object
    if (process.env.USE_TEST_NETWORK === "true") {
      logger.info("Creating NFT in test mode");

      // Create a mock NFT with a simple ID
      const mockNFT = {
        _id: new mongoose.Types.ObjectId().toString(),
        tokenId,
        name,
        description: description || "",
        imageUrl: image,
        metadataUrl,
        creator: req.user._id || "test-user-id",
        owner: req.user._id || "test-user-id",
        collection: collection || null,
        price: parseFloat(price),
        currency: "ETH",
        isListed: true,
        category: category || "Art",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      logger.info(`Test NFT created: ${mockNFT._id}`);

      return res.status(201).json({
        success: true,
        nft: mockNFT,
      });
    }

    // For production mode, create and save to MongoDB
    const newNFT = new NFT({
      tokenId,
      name,
      description: description || "",
      imageUrl: image,
      metadataUrl,
      creator: req.user._id,
      owner: req.user._id,
      collection: collection ? collection : null,
      price: parseFloat(price),
      currency: "ETH",
      isListed: true,
      category: category || "Art",
    });

    // Save the NFT to MongoDB
    const savedNFT = await newNFT.save();

    logger.info(`NFT minted: ${savedNFT._id}`);

    res.status(201).json({
      success: true,
      nft: savedNFT,
    });
  } catch (error) {
    logger.error(`Mint NFT error: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error minting NFT", error: error.message });
  }
};

// Get all NFTs
export const getAllNFTs = async (req, res) => {
  try {
    logger.info("Fetching all NFTs");

    // For test mode, return mock NFTs
    if (process.env.USE_TEST_NETWORK === "true") {
      logger.info("Using test mode for getAllNFTs");

      // Create mock NFTs
      const mockNFTs = [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          tokenId: "1",
          name: "Test NFT #1",
          description: "A test NFT for development",
          imageUrl: "https://via.placeholder.com/500",
          metadataUrl: "ipfs://mock-ipfs-hash-123",
          creator: "test-user-id",
          owner: "test-user-id",
          price: 0.1,
          currency: "ETH",
          isListed: true,
          category: "Art",
          likes: 0,
          views: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: new mongoose.Types.ObjectId().toString(),
          tokenId: "2",
          name: "Test NFT #2",
          description: "Another test NFT for development",
          imageUrl: "https://via.placeholder.com/500",
          metadataUrl: "ipfs://mock-ipfs-hash-456",
          creator: "test-user-id",
          owner: "test-user-id",
          price: 0.2,
          currency: "ETH",
          isListed: false,
          category: "Collectibles",
          likes: 5,
          views: 20,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: new mongoose.Types.ObjectId().toString(),
          tokenId: "3",
          name: "Test NFT #3",
          description: "A third test NFT for development",
          imageUrl: "https://via.placeholder.com/500",
          metadataUrl: "ipfs://mock-ipfs-hash-789",
          creator: "test-user-id",
          owner: "another-test-user-id",
          price: 0.5,
          currency: "ETH",
          isListed: true,
          category: "Photography",
          likes: 10,
          views: 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return res.status(200).json({
        success: true,
        count: mockNFTs.length,
        nfts: mockNFTs,
      });
    }

    const nfts = await NFT.find()
      .populate("creator", "username avatar")
      .populate("owner", "username avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: nfts.length,
      nfts,
    });
  } catch (error) {
    logger.error(`Get all NFTs error: ${error.message}`);
    res.status(500).json({
      message: "Error fetching NFTs",
      error: error.message,
    });
  }
};

// Get NFT by ID
export const getNFTById = async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Fetching NFT by ID: ${id}`);

    // For test mode, return a mock NFT
    if (process.env.USE_TEST_NETWORK === "true") {
      logger.info("Using test mode for getNFTById");

      // Create a mock NFT with the requested ID
      const mockNFT = {
        _id: id,
        tokenId: "123",
        name: "Test NFT Detail",
        description: "A detailed test NFT for development",
        imageUrl: "https://via.placeholder.com/800",
        metadataUrl: "ipfs://mock-ipfs-hash-detail",
        creator: "test-user-id",
        owner: "test-user-id",
        price: 0.3,
        currency: "ETH",
        isListed: true,
        category: "Art",
        likes: 15,
        views: 101,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return res.status(200).json({
        success: true,
        nft: mockNFT,
      });
    }

    const nft = await NFT.findById(id)
      .populate("creator", "username avatar")
      .populate("owner", "username avatar")
      .populate("collection");

    if (!nft) {
      return res.status(404).json({ message: "NFT not found" });
    }

    // Increment views
    nft.views += 1;
    await nft.save();

    res.status(200).json({
      success: true,
      nft,
    });
  } catch (error) {
    logger.error(`Get NFT by ID error: ${error.message}`);
    res.status(500).json({
      message: "Error fetching NFT",
      error: error.message,
    });
  }
};

// Get NFTs by owner
export const getNFTsByOwner = async (req, res) => {
  try {
    const { address } = req.params;

    logger.info(`Fetching NFTs for owner: ${address}`);

    // For test mode, return mock NFTs
    if (process.env.USE_TEST_NETWORK === "true") {
      logger.info("Using test mode for getNFTsByOwner");

      // Create mock NFTs for the address
      const mockNFTs = [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          tokenId: "1",
          name: "Test NFT #1",
          description: "A test NFT for development",
          imageUrl: "https://via.placeholder.com/500",
          metadataUrl: "ipfs://mock-ipfs-hash-123",
          creator: "test-user-id",
          owner: "test-user-id",
          price: 0.1,
          currency: "ETH",
          isListed: true,
          category: "Art",
          likes: 0,
          views: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: new mongoose.Types.ObjectId().toString(),
          tokenId: "2",
          name: "Test NFT #2",
          description: "Another test NFT for development",
          imageUrl: "https://via.placeholder.com/500",
          metadataUrl: "ipfs://mock-ipfs-hash-456",
          creator: "test-user-id",
          owner: "test-user-id",
          price: 0.2,
          currency: "ETH",
          isListed: false,
          category: "Collectibles",
          likes: 5,
          views: 20,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return res.status(200).json({
        success: true,
        count: mockNFTs.length,
        nfts: mockNFTs,
      });
    }

    // Find user by wallet address
    const user = await User.findOne({ walletAddress: address });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const nfts = await NFT.find({ owner: user._id })
      .populate("creator", "username avatar")
      .populate("collection")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: nfts.length,
      nfts,
    });
  } catch (error) {
    logger.error(`Get NFTs by owner error: ${error.message}`);
    res.status(500).json({
      message: "Error fetching user's NFTs",
      error: error.message,
    });
  }
};

// Get NFTs created by a user
export const getNFTsByCreator = async (req, res) => {
  try {
    const { address } = req.params;
    logger.info(`Fetching NFTs created by: ${address}`);

    // For test mode, return mock NFTs
    if (process.env.USE_TEST_NETWORK === "true") {
      logger.info("Using test mode for getNFTsByCreator");

      // Create mock NFTs for the creator
      const mockNFTs = [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          tokenId: "101",
          name: "Created NFT #1",
          description: "An NFT created by this user",
          imageUrl: "https://via.placeholder.com/500",
          metadataUrl: "ipfs://mock-ipfs-hash-created-1",
          creator: "test-user-id",
          owner: "another-user-id",
          price: 0.15,
          currency: "ETH",
          isListed: true,
          category: "Art",
          likes: 3,
          views: 25,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: new mongoose.Types.ObjectId().toString(),
          tokenId: "102",
          name: "Created NFT #2",
          description: "Another NFT created by this user",
          imageUrl: "https://via.placeholder.com/500",
          metadataUrl: "ipfs://mock-ipfs-hash-created-2",
          creator: "test-user-id",
          owner: "test-user-id",
          price: 0.25,
          currency: "ETH",
          isListed: false,
          category: "Music",
          likes: 7,
          views: 42,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return res.status(200).json({
        success: true,
        count: mockNFTs.length,
        nfts: mockNFTs,
      });
    }

    // Find user by wallet address
    const user = await User.findOne({ walletAddress: address });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const nfts = await NFT.find({ creator: user._id })
      .populate("owner", "username avatar")
      .populate("collection")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: nfts.length,
      nfts,
    });
  } catch (error) {
    logger.error(`Get NFTs by creator error: ${error.message}`);
    res.status(500).json({
      message: "Error fetching user's created NFTs",
      error: error.message,
    });
  }
};

// Create auction for an NFT
export const createAuction = async (req, res) => {
  try {
    const { nftId, startingPrice, duration } = req.body;

    // Simple validation
    if (!nftId || !startingPrice || !duration) {
      return res.status(400).json({
        message: "Please provide nftId, startingPrice, and duration",
      });
    }

    // Find the NFT
    const nft = await NFT.findById(nftId);
    if (!nft) {
      return res.status(404).json({ message: "NFT not found" });
    }

    // Check ownership
    if (nft.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized, you do not own this NFT" });
    }

    // Calculate end time
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + parseInt(duration));

    // Update NFT
    nft.isAuction = true;
    nft.auctionEnd = endTime;
    nft.highestBid = parseFloat(startingPrice);

    await nft.save();

    logger.info(`Auction created for NFT: ${nftId}`);

    res.status(201).json({
      success: true,
      nft,
    });
  } catch (error) {
    logger.error(`Create auction error: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error creating auction", error: error.message });
  }
};

// Place bid on an auction
export const placeBid = async (req, res) => {
  try {
    const { nftId, bidAmount } = req.body;

    // Simple validation
    if (!nftId || !bidAmount) {
      return res
        .status(400)
        .json({ message: "Please provide nftId and bidAmount" });
    }

    // Find the NFT
    const nft = await NFT.findById(nftId);
    if (!nft) {
      return res.status(404).json({ message: "NFT not found" });
    }

    // Check if it's an active auction
    if (!nft.isAuction) {
      return res.status(400).json({ message: "This NFT is not in an auction" });
    }

    // Check if auction ended
    if (nft.auctionEnd && new Date(nft.auctionEnd) < new Date()) {
      nft.isAuction = false;
      await nft.save();
      return res.status(400).json({ message: "Auction has ended" });
    }

    // Check if bid is higher than current highest bid
    if (parseFloat(bidAmount) <= nft.highestBid) {
      return res.status(400).json({
        message: `Bid amount must be higher than current highest bid: ${nft.highestBid} ETH`,
      });
    }

    // Check if bidder is the owner
    if (nft.owner.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot bid on your own NFT" });
    }

    // Update NFT with new highest bid
    nft.highestBid = parseFloat(bidAmount);
    nft.highestBidder = req.user._id;

    await nft.save();

    logger.info(`Bid placed on NFT: ${nftId}, amount: ${bidAmount} ETH`);

    res.status(200).json({
      success: true,
      nft,
    });
  } catch (error) {
    logger.error(`Place bid error: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error placing bid", error: error.message });
  }
};
