import { ethers } from "ethers";
import { nftMarketContract, provider, isTestMode } from "../config/web3.js";
import { NFT, Transaction } from "../models/index.js";
import { logger } from "../utils/logger.js";

// Mock NFT data
const nfts = [];
let nextTokenId = 0;

// Buy an NFT
export const buyNFT = async (req, res) => {
  try {
    const { tokenId } = req.body;

    // Find the NFT
    const nftIndex = nfts.findIndex((nft) => nft.tokenId === parseInt(tokenId));
    if (nftIndex === -1) {
      return res.status(404).json({ message: "NFT not found" });
    }

    const nft = nfts[nftIndex];

    // Check if NFT is for sale
    if (!nft.listed || nft.sold) {
      return res.status(400).json({ message: "NFT is not for sale" });
    }

    // Check if user is trying to buy their own NFT
    if (nft.owner === req.user.id) {
      return res.status(400).json({ message: "You cannot buy your own NFT" });
    }

    // Process purchase - in a real implementation, this would involve blockchain transactions
    const oldOwner = nft.owner;
    nft.owner = req.user.id;
    nft.sold = true;
    nft.listed = false;
    nft.saleDate = new Date().toISOString();

    // Create transaction record
    const transaction = {
      tokenId: nft.tokenId,
      seller: oldOwner,
      buyer: req.user.id,
      price: nft.price,
      date: new Date().toISOString(),
      hash: `mock-tx-${Date.now()}`,
    };

    logger.info(
      `NFT purchased: ${tokenId} by user ${req.user.id} from ${oldOwner}`
    );

    res.status(200).json({
      success: true,
      nft,
      transaction,
    });
  } catch (error) {
    logger.error(`Buy NFT error: ${error.message}`);
    res.status(500).json({ message: "Error buying NFT", error: error.message });
  }
};

// List an NFT for sale
export const listNFT = async (req, res) => {
  try {
    const { tokenId, price } = req.body;

    // Find the NFT
    const nftIndex = nfts.findIndex((nft) => nft.tokenId === parseInt(tokenId));
    if (nftIndex === -1) {
      return res.status(404).json({ message: "NFT not found" });
    }

    const nft = nfts[nftIndex];

    // Check ownership
    if (nft.owner !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized, you do not own this NFT" });
    }

    // Update NFT
    nft.price = price;
    nft.listed = true;
    nft.sold = false;

    logger.info(
      `NFT listed: ${tokenId} by user ${req.user.id} for ${price} ETH`
    );

    res.status(200).json({
      success: true,
      nft,
    });
  } catch (error) {
    logger.error(`List NFT error: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error listing NFT", error: error.message });
  }
};

export const buyNFTFromBlockchain = async (req, res) => {
  try {
    const { tokenId, price } = req.body;
    const userId = req.user._id;

    // Verify NFT exists and is for sale
    const nft = await NFT.findOne({ tokenId, isListed: true }).populate(
      "owner"
    );

    if (!nft) {
      return res.status(400).json({
        success: false,
        error: "NFT not found or not for sale",
      });
    }

    let receipt;

    // REAL BLOCKCHAIN INTERACTION
    if (!isTestMode()) {
      // Convert price to wei
      const priceInWei = ethers.parseEther(price.toString());

      // Create buy transaction
      const transaction = await nftMarketContract.createMarketSale(tokenId, {
        value: priceInWei,
      });

      // Wait for transaction to be mined
      receipt = await transaction.wait();
    }
    // MOCK BLOCKCHAIN INTERACTION
    else {
      logger.info(
        "Test mode: Creating mock purchase without real blockchain interaction"
      );

      try {
        // For complete test environment, we can interact with the local blockchain
        const wallet = new ethers.Wallet(
          "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
          provider
        );
        const contractWithSigner = nftMarketContract.connect(wallet);

        // Convert price to wei
        const priceInWei = ethers.parseEther(price.toString());

        // Create market sale on local blockchain
        const tx = await contractWithSigner.createMarketSale(tokenId, {
          value: priceInWei,
        });

        receipt = await tx.wait();
      } catch (error) {
        logger.warn(
          `Local blockchain interaction failed, using mock receipt: ${error.message}`
        );
        receipt = { hash: `mock-sale-${Date.now()}` };
      }
    }

    // Store previous owner for transaction record
    const previousOwner = nft.owner;

    // Update database - same for both real and test mode
    nft.owner = userId;
    nft.isListed = false;
    nft.price = null;
    await nft.save();

    // Record transaction - same for both real and test mode
    const newTransaction = new Transaction({
      nft: nft._id,
      seller: previousOwner,
      buyer: userId,
      price: price,
      transactionHash: receipt?.hash || "mock-transaction-hash",
      type: "sale",
    });

    await newTransaction.save();

    logger.info(`NFT purchased: ${tokenId}`);
    res.status(200).json({
      success: true,
      data: {
        tokenId,
        transactionHash: receipt?.hash || "mock-transaction-hash",
        nft,
      },
    });
  } catch (error) {
    logger.error("NFT purchase error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const listNFTFromBlockchain = async (req, res) => {
  try {
    const { tokenId, price } = req.body;
    const userId = req.user._id;

    // Verify NFT exists and user is the owner
    const nft = await NFT.findOne({ tokenId }).populate("owner");

    if (!nft) {
      return res.status(404).json({
        success: false,
        error: "NFT not found",
      });
    }

    if (nft.owner._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized. You are not the owner",
      });
    }

    let receipt;

    // REAL BLOCKCHAIN INTERACTION
    if (!isTestMode()) {
      // Convert price to wei
      const priceInWei = ethers.parseEther(price.toString());

      // Get listing price
      const listingPrice = await nftMarketContract.getListingPrice();

      // Create listing transaction
      const transaction = await nftMarketContract.listNFT(tokenId, priceInWei, {
        value: listingPrice,
      });

      // Wait for transaction to be mined
      receipt = await transaction.wait();
    }
    // MOCK BLOCKCHAIN INTERACTION
    else {
      logger.info(
        "Test mode: Creating mock listing without real blockchain interaction"
      );

      try {
        // For complete test environment, we can interact with the local blockchain
        const wallet = new ethers.Wallet(
          "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
          provider
        );
        const contractWithSigner = nftMarketContract.connect(wallet);

        // Convert price to wei
        const priceInWei = ethers.parseEther(price.toString());

        // Get listing price
        const listingPrice = await contractWithSigner.getListingPrice();

        // List NFT on local blockchain
        const tx = await contractWithSigner.listNFT(tokenId, priceInWei, {
          value: listingPrice,
        });

        receipt = await tx.wait();
      } catch (error) {
        logger.warn(
          `Local blockchain interaction failed, using mock receipt: ${error.message}`
        );
        receipt = { hash: `mock-list-${Date.now()}` };
      }
    }

    // Update NFT in database - same for both real and test mode
    nft.isListed = true;
    nft.price = price;
    nft.isAuction = false;
    await nft.save();

    logger.info(`NFT listed: ${tokenId}`);
    res.status(200).json({
      success: true,
      data: {
        tokenId,
        transactionHash: receipt?.hash || "mock-transaction-hash",
        nft,
      },
    });
  } catch (error) {
    logger.error("NFT listing error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
