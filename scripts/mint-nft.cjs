// scripts/mint-nft.cjs
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
  const price = hre.ethers.parseEther("0.1"); // 0.1 ETH

  try {
    // Get the listing price
    const listingPrice = await nftMarket.getListingPrice();
    console.log(`Listing price: ${hre.ethers.formatEther(listingPrice)} ETH`);

    // Mint a new NFT using the mintNFT function from our contract
    console.log("Minting NFT...");
    const tx = await nftMarket.mintNFT(tokenURI, price, {
      value: listingPrice,
    });

    console.log(`Transaction hash: ${tx.hash}`);
    await tx.wait();

    console.log("NFT minted successfully!");

    // Try to get the newly minted token ID
    const events = await nftMarket.queryFilter("MarketItemCreated");
    if (events.length > 0) {
      const latestEvent = events[events.length - 1];
      console.log(`Minted NFT with ID: ${latestEvent.args.tokenId}`);
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
