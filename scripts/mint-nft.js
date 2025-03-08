// scripts/mint-nft.js
const hre = require("hardhat");

async function main() {
  console.log("Minting NFT on local network...");

  // Get the deployed MockNFTMarket contract
  const MockNFTMarket = await hre.ethers.getContractFactory("MockNFTMarket");

  // Get the first signer/account to use as the minter
  const [owner] = await hre.ethers.getSigners();

  // Get the deployed contract address from the local deployment
  // You may need to replace this with your actual deployed contract address
  // This assumes the contract is already deployed
  const contractAddress = process.env.NFT_CONTRACT_ADDRESS;

  if (!contractAddress) {
    console.error("Please set the NFT_CONTRACT_ADDRESS environment variable");
    console.log(
      "You can find this address after deploying the contract with deploy-local.js"
    );
    process.exit(1);
  }

  const nftMarket = MockNFTMarket.attach(contractAddress);

  console.log(`Using MockNFTMarket at address: ${contractAddress}`);
  console.log(`Minting as user: ${owner.address}`);

  // Sample metadata for the NFT
  const tokenURI = "ipfs://QmSampleIPFSCIDForTestingPurposesOnly";
  const name = "Sample NFT";
  const description = "A test NFT minted locally";
  const price = hre.ethers.utils.parseEther("0.1"); // 0.1 ETH

  try {
    // Mint a new NFT
    // Note: The exact function call depends on your contract implementation
    // This is a common pattern but may need adjustments based on your contract
    const tx = await nftMarket.createToken(tokenURI, price, name, description);

    console.log(`Transaction hash: ${tx.hash}`);
    await tx.wait();

    console.log("NFT minted successfully!");

    // You can try to get the token ID of the newly minted NFT
    // This assumes your contract keeps track of the last minted token ID
    // Adjust this based on your contract's implementation
    try {
      const tokenId = await nftMarket.getLastTokenId();
      console.log(`Minted NFT with ID: ${tokenId}`);
    } catch (error) {
      console.log(
        "Could not retrieve token ID - this depends on your contract implementation"
      );
    }
  } catch (error) {
    console.error("Error minting NFT:", error.message);
    // If there's a function signature error, log additional help
    if (error.message.includes("function signature")) {
      console.log(
        "\nThe function call might not match your contract. Check your contract methods and update this script accordingly."
      );
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
