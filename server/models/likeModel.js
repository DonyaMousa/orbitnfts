import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nft: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NFT",
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
    },
  }
);

// Compound index to ensure a user can only like an NFT once
likeSchema.index({ user: 1, nft: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);

export default Like;
