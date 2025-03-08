import mongoose from "mongoose";

const viewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    nft: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NFT",
      required: true,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
    },
  }
);

const View = mongoose.model("View", viewSchema);

export default View;
