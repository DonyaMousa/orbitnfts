// Script to deploy the mock NFT market contract to a local network
const hre = require("hardhat");

async function main() {
  console.log("Deploying MockNFTMarket...");

  // Deploy the contract
  const MockNFTMarket = await hre.ethers.getContractFactory("MockNFTMarket");
  const nftMarket = await MockNFTMarket.deploy();

  // For Hardhat v2.14.0+
  await nftMarket.waitForDeployment();
  const address = await nftMarket.getAddress();

  console.log(`MockNFTMarket deployed to: ${address}`);
  console.log("\nAdd this address to your .env file as NFT_CONTRACT_ADDRESS");
  console.log("\nExample:");
  console.log(`NFT_CONTRACT_ADDRESS=${address}`);
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
