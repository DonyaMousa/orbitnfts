const hre = require("hardhat");

async function main() {
  console.log("Viewing NFTs on local network...");

  // Get the deployed MockNFTMarket contract
  const MockNFTMarket = await hre.ethers.getContractFactory("MockNFTMarket");

  // Get the first signer/account
  const [owner] = await hre.ethers.getSigners();

  // Get the deployed contract address from the local deployment
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
  console.log(`Viewing NFTs for address: ${owner.address}`);

  try {
    // This function name and parameters will depend on your contract implementation
    // You might need to adjust this based on your contract
    const myNFTs = await nftMarket.fetchMyNFTs();

    console.log(`Found ${myNFTs.length} NFTs owned by you:`);

    // Format and display each NFT
    // The properties available depend on your contract implementation
    for (let i = 0; i < myNFTs.length; i++) {
      const nft = myNFTs[i];
      console.log(`\nNFT #${i + 1}:`);
      console.log(`Token ID: ${nft.tokenId?.toString() || "Unknown"}`);
      console.log(
        `Price: ${hre.ethers.utils.formatEther(nft.price || "0")} ETH`
      );
      console.log(`Name: ${nft.name || "Unnamed"}`);
      console.log(`Description: ${nft.description || "No description"}`);
      console.log(`Token URI: ${nft.tokenURI || "No URI"}`);
      console.log(`Owner: ${nft.owner || "Unknown"}`);
      console.log(`Sold: ${nft.sold ? "Yes" : "No"}`);
    }

    if (myNFTs.length === 0) {
      console.log("You don't own any NFTs yet. Try minting one first!");
    }
  } catch (error) {
    console.error("Error viewing NFTs:", error.message);

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
