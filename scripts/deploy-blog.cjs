// Script to deploy the BlogPost and BlogComment contracts
const hre = require("hardhat");

async function main() {
  console.log("Deploying blog contracts...");

  // Deploy BlogPost contract
  const BlogPost = await hre.ethers.getContractFactory("BlogPost");
  const blogPost = await BlogPost.deploy();
  await blogPost.waitForDeployment();
  const blogPostAddress = await blogPost.getAddress();

  console.log(`BlogPost contract deployed to: ${blogPostAddress}`);

  // Deploy BlogComment contract
  const BlogComment = await hre.ethers.getContractFactory("BlogComment");
  const blogComment = await BlogComment.deploy(blogPostAddress);
  await blogComment.waitForDeployment();
  const blogCommentAddress = await blogComment.getAddress();

  console.log(`BlogComment contract deployed to: ${blogCommentAddress}`);

  console.log("Blog contracts deployment completed!");

  // Return the deployed contract addresses for testing purposes
  return { blogPostAddress, blogCommentAddress };
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

module.exports = main;
