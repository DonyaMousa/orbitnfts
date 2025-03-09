// Test script for minting a blog post as an NFT
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  console.log("\n🚀 Testing Blog Post Minting Process...\n");

  try {
    // Get the deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Using account: ${deployer.address}`);
    console.log(`Account balance: ${(await deployer.getBalance()).toString()}`);

    // Load the BlogPost contract
    const BlogPost = await hre.ethers.getContractFactory("BlogPost");

    // Get the deployed contract address
    let blogPostAddress;

    // Check if a contract address is provided in .env
    if (process.env.BLOG_POST_CONTRACT_ADDRESS) {
      blogPostAddress = process.env.BLOG_POST_CONTRACT_ADDRESS;
      console.log(`Using existing BlogPost contract: ${blogPostAddress}`);
    } else {
      // If not, deploy a new contract
      console.log(
        "No contract address found. Deploying a new BlogPost contract..."
      );
      const blogPost = await BlogPost.deploy();
      await blogPost.waitForDeployment();
      blogPostAddress = await blogPost.getAddress();
      console.log(`BlogPost contract deployed to: ${blogPostAddress}`);
    }

    // Create a contract instance
    const blogPostContract = BlogPost.attach(blogPostAddress);

    // Create sample post metadata
    const postMetadata = {
      content:
        "This is my first blog post minted as an NFT! #OrbitBlocks #Web3",
      authorName: "Test User",
      authorAvatar: "",
      attachments: [],
      timestamp: new Date().toISOString(),
    };

    console.log(
      `\n📝 Creating blog post with content: "${postMetadata.content}"`
    );

    // In a real scenario, we would upload this to IPFS
    // For this test, we'll use a mock IPFS hash
    const mockIpfsHash = `ipfs-mock-hash-${Math.floor(Math.random() * 1000)}`;
    console.log(`🔗 Mock IPFS hash: ${mockIpfsHash}`);

    // Mint the blog post as NFT
    console.log("\n⛏️ Minting blog post as NFT...");
    const tx = await blogPostContract.createPost(mockIpfsHash);
    console.log(`Transaction submitted: ${tx.hash}`);

    // Wait for transaction to be mined
    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

    // Get the token ID from the PostCreated event
    const event = receipt.events?.find(
      (event) => event.event === "PostCreated"
    );
    const tokenId = event?.args?.tokenId.toString();
    console.log(`🎉 Blog post minted with token ID: ${tokenId}`);

    // Get post details
    console.log("\n📊 Fetching post details...");
    const post = await blogPostContract.getPost(tokenId);

    console.log(`\nPost Details:`);
    console.log(`---------------`);
    console.log(`Token ID: ${post.tokenId}`);
    console.log(`Author: ${post.author}`);
    console.log(`IPFS Hash: ${post.ipfsHash}`);
    console.log(
      `Timestamp: ${new Date(post.timestamp * 1000).toLocaleString()}`
    );
    console.log(`Likes: ${post.likesCount}`);
    console.log(`Is Published: ${post.isPublished}`);

    // Like the post to test like functionality
    console.log("\n❤️ Testing like functionality...");
    const likeTx = await blogPostContract.likePost(tokenId);
    await likeTx.wait();

    // Check if post has been liked
    const hasLiked = await blogPostContract.hasLiked(tokenId, deployer.address);
    const updatedPost = await blogPostContract.getPost(tokenId);
    console.log(`Like status: ${hasLiked ? "Liked" : "Not liked"}`);
    console.log(`Updated like count: ${updatedPost.likesCount}`);

    console.log("\n✅ Blog post minting test completed successfully!\n");

    return {
      tokenId,
      ipfsHash: mockIpfsHash,
      author: deployer.address,
    };
  } catch (error) {
    console.error("Error in test:", error);
    process.exit(1);
  }
}

// Execute the script
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
