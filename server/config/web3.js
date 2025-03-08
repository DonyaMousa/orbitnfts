import { ethers } from "ethers";
import { config } from "dotenv";
import { logger } from "../utils/logger.js";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

config();

// Determine if we're in test mode
const TEST_MODE =
  process.env.NODE_ENV === "test" || process.env.USE_TEST_NETWORK === "true";
logger.info(`Web3 config: ${TEST_MODE ? "TEST MODE" : "PRODUCTION MODE"}`);

// Get the directory name using ESM compatible approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read ABI from JSON file
let MockNFTMarketABI;
try {
  const abiPath = path.join(
    __dirname,
    "../../artifacts/contracts/MockNFTMarket.sol/MockNFTMarket.json"
  );
  const abiData = readFileSync(abiPath, "utf8");
  MockNFTMarketABI = JSON.parse(abiData);
  logger.info("ABI loaded successfully");
} catch (error) {
  logger.warn(`Error loading ABI: ${error.message}`);
  // Create a placeholder ABI for testing purposes
  MockNFTMarketABI = {
    abi: [
      {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        inputs: [],
        name: "getListingPrice",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "tokenURI",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
        ],
        name: "mintNFT",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "payable",
        type: "function",
      },
    ],
  };
  logger.info("Using mock ABI for testing");
}

// Initialize provider based on environment
let provider;
let nftMarketContract;
let contractAddress;

const initializeWeb3 = () => {
  const isTestMode = process.env.USE_TEST_NETWORK === "true";

  try {
    if (isTestMode) {
      logger.info("Initializing Web3 in test mode with local provider");
      provider = new ethers.JsonRpcProvider("http://localhost:8545");
      contractAddress =
        process.env.NFT_CONTRACT_ADDRESS ||
        "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    } else {
      logger.info("Initializing Web3 with Infura provider");
      const network = process.env.ETHEREUM_NETWORK || "sepolia";
      provider = new ethers.InfuraProvider(
        network,
        process.env.INFURA_PROJECT_ID
      );
      contractAddress = process.env.NFT_MARKET_ADDRESS;
    }

    // Initialize contract instance
    if (contractAddress) {
      nftMarketContract = new ethers.Contract(
        contractAddress,
        MockNFTMarketABI.abi,
        provider
      );

      logger.info(`NFT Market contract initialized at ${contractAddress}`);
    } else {
      logger.warn("Contract address not provided");
    }
  } catch (error) {
    logger.error(`Web3 initialization error: ${error.message}`);
  }
};

// Initialize Web3 connection
initializeWeb3();

// Export the functions that will be mocked in test mode
export { provider, nftMarketContract, contractAddress };

export const isTestMode = () => TEST_MODE;

export default {
  provider,
  nftMarketContract,
  isTestMode,
};
