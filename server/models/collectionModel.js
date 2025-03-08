import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bannerUrl: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    floorPrice: {
      type: Number,
      default: 0,
    },
    volume: {
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
collectionSchema.index({ name: "text", description: "text" });

const Collection = mongoose.model("Collection", collectionSchema);

export default Collection;
