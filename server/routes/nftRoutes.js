import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  mintNFT,
  createAuction,
  placeBid,
  getAllNFTs,
  getNFTById,
  getNFTsByOwner,
  getNFTsByCreator,
} from "../controllers/nftController.js";

const router = express.Router();

// Protected routes
router.post("/mint", protect, mintNFT);
router.post("/auction/create", protect, createAuction);
router.post("/auction/bid", protect, placeBid);

// Public routes
router.get("/", getAllNFTs);
router.get("/owner/:address", getNFTsByOwner);
router.get("/creator/:address", getNFTsByCreator);

// This route needs to be last to avoid conflicts with the above routes
router.get("/:id", getNFTById);

export default router;
