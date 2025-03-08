// Script to deploy the mock NFT market contract to a local network
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying MockNFTMarket...");

  // Deploy the contract
  const MockNFTMarket = await ethers.getContractFactory("MockNFTMarket");
  const nftMarket = await MockNFTMarket.deploy();

  await nftMarket.deployed();

  console.log(`MockNFTMarket deployed to: ${nftMarket.address}`);
  console.log("\nAdd this address to your .env file as LOCAL_CONTRACT_ADDRESS");
  console.log("\nExample:");
  console.log(`LOCAL_CONTRACT_ADDRESS=${nftMarket.address}`);
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
