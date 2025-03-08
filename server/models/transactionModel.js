import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    nft: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NFT",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "ETH",
    },
    transactionHash: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["sale", "auction", "mint", "transfer"],
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
    },
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
