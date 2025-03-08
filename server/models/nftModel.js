import mongoose from "mongoose";

const nftSchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
    },
    price: {
      type: Number,
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
    auctionEnd: {
      type: Date,
    },
    highestBid: {
      type: Number,
    },
    highestBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

// Add a text index for search functionality
nftSchema.index({ name: "text", description: "text" });

const NFT = mongoose.model("NFT", nftSchema);

export default NFT;
