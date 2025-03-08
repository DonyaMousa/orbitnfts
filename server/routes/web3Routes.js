// Web3 routes with graceful degradation if web3 config fails
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { buyNFT, listNFT } from "../controllers/web3Controller.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// Default contract address for testing
const DEFAULT_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Get contract info with fallback
router.get("/contract", (req, res) => {
  try {
    // Try to import the web3 config dynamically
    import("../config/web3.js")
      .then((web3Config) => {
        res.json({
          address:
            web3Config.contractAddress ||
            process.env.NFT_CONTRACT_ADDRESS ||
            DEFAULT_CONTRACT_ADDRESS,
          name: "OrbitNFTs",
          symbol: "ORBIT",
          network: process.env.USE_TEST_NETWORK
            ? "localhost"
            : process.env.ETHEREUM_NETWORK || "localhost",
        });
      })
      .catch((error) => {
        // If import fails, return fallback data
        logger.warn(`Failed to import web3 config: ${error.message}`);
        res.json({
          address: process.env.NFT_CONTRACT_ADDRESS || DEFAULT_CONTRACT_ADDRESS,
          name: "OrbitNFTs",
          symbol: "ORBIT",
          network: process.env.USE_TEST_NETWORK ? "localhost" : "unknown",
          status: "limited",
        });
      });
  } catch (error) {
    // Fallback response
    res.json({
      address: process.env.NFT_CONTRACT_ADDRESS || DEFAULT_CONTRACT_ADDRESS,
      name: "OrbitNFTs (Mock)",
      symbol: "ORBIT",
      network: "localhost",
      status: "mock",
    });
  }
});

// Handler functions that don't depend on web3 config
router.get("/gas-price", (req, res) => {
  // For testing, return mock values
  res.json({
    gasPrice: "20000000000", // 20 Gwei
    maxFeePerGas: "25000000000", // 25 Gwei
    maxPriorityFeePerGas: "1500000000", // 1.5 Gwei
    estimatedBaseFee: "23500000000", // 23.5 Gwei
  });
});

// Get transaction receipt
router.get("/tx/:hash", (req, res) => {
  const { hash } = req.params;

  // For testing, we'll return a mock receipt
  res.json({
    transactionHash: hash,
    blockNumber: 1,
    from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    to: DEFAULT_CONTRACT_ADDRESS,
    status: 1, // Success
    gasUsed: "100000",
  });
});

// Simulate transaction to estimate gas
router.post("/estimate-gas", (req, res) => {
  const { functionName, params } = req.body;

  // For testing, return mock gas estimate
  let gasEstimate;

  switch (functionName) {
    case "mintNFT":
      gasEstimate = "120000";
      break;
    case "createMarketSale":
      gasEstimate = "150000";
      break;
    case "createAuction":
      gasEstimate = "200000";
      break;
    case "placeBid":
      gasEstimate = "100000";
      break;
    default:
      gasEstimate = "80000";
  }

  res.json({
    gasEstimate,
    data: {
      functionName,
      params,
    },
  });
});

// Get wallet balance
router.get("/balance/:address", (req, res) => {
  const { address } = req.params;

  // For testing, return mock balance
  res.json({
    address,
    balance: "10000000000000000000", // 10 ETH
    balanceEth: "10.0",
  });
});

// Add the existing routes
router.post("/buy", protect, buyNFT);
router.post("/list", protect, listNFT);

export default router;
