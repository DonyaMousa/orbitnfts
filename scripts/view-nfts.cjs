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
      "You can find this address after deploying the contract with deploy-local.cjs"
    );
    process.exit(1);
  }

  const nftMarket = MockNFTMarket.attach(contractAddress);

  console.log(`Using MockNFTMarket at address: ${contractAddress}`);
  console.log(`Viewing NFTs for address: ${owner.address}`);

  try {
    // Our contract doesn't have a fetchMyNFTs function directly
    // Instead, we'll look for all MarketItemCreated events and filter
    console.log("Searching for NFTs...");

    // Get all MarketItemCreated events
    const events = await nftMarket.queryFilter("MarketItemCreated");

    if (events.length === 0) {
      console.log("No NFTs found. Try minting one first!");
      return;
    }

    console.log(`Found ${events.length} NFT events in total.`);

    // For each token, get its details
    const nftPromises = events.map(async (event) => {
      const tokenId = event.args.tokenId;
      const details = await nftMarket.getMarketItem(tokenId);
      const tokenURI = await nftMarket.tokenURI(tokenId);

      return {
        tokenId,
        owner: details[2], // owner is the third return value
        seller: details[1], // seller is the second return value
        price: details[3], // price is the fourth return value
        sold: details[4], // sold is the fifth return value
        tokenURI,
      };
    });

    const nfts = await Promise.all(nftPromises);

    // Filter NFTs owned by the current user
    const myNFTs = nfts.filter(
      (nft) =>
        nft.owner.toLowerCase() === owner.address.toLowerCase() ||
        nft.seller.toLowerCase() === owner.address.toLowerCase()
    );

    console.log(`Found ${myNFTs.length} NFTs owned or listed by you:`);

    // Display each NFT
    for (let i = 0; i < myNFTs.length; i++) {
      const nft = myNFTs[i];
      console.log(`\nNFT #${i + 1}:`);
      console.log(`Token ID: ${nft.tokenId.toString()}`);
      console.log(`Price: ${hre.ethers.formatEther(nft.price)} ETH`);
      console.log(`Token URI: ${nft.tokenURI}`);
      console.log(`Owner: ${nft.owner === owner.address ? "You" : nft.owner}`);
      console.log(
        `Seller: ${nft.seller === owner.address ? "You" : nft.seller}`
      );
      console.log(`Sold: ${nft.sold ? "Yes" : "No"}`);
    }

    if (myNFTs.length === 0) {
      console.log("You don't own or sell any NFTs yet. Try minting one first!");
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
