#!/usr/bin/env node

// Simple script to test blog post creation
const fetch = require("node-fetch");
const readline = require("readline");

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to prompt user
const prompt = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

// Base URL
const API_BASE_URL = "http://localhost:5001";

// Main function
async function main() {
  console.log("\n🚀 Quick Blog Post Creation Test\n");

  try {
    // Step 1: Get a test token
    console.log("📝 Step 1: Getting a test token...");
    const tokenResponse = await fetch(`${API_BASE_URL}/api/auth/test-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.success) {
      throw new Error(
        `Failed to get test token: ${tokenData.error || "Unknown error"}`
      );
    }

    const token = tokenData.token;
    console.log("✅ Got test token successfully!");

    // Step 2: Create a blog post
    console.log("\n📝 Step 2: Creating a blog post...");
    const content = await prompt(
      "Enter post content (or press Enter for default): "
    );

    const postContent =
      content ||
      "This is a test blog post created with the quick test script! #testing #NFT";

    const postResponse = await fetch(`${API_BASE_URL}/api/blog/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: postContent,
      }),
    });

    const postData = await postResponse.json();

    if (!postData.success) {
      console.error("❌ Error response from server:", postData);
      throw new Error(
        `Failed to create blog post: ${postData.error || "Unknown error"}`
      );
    }

    console.log("\n✅ Blog post created successfully!");
    console.log(`Post ID: ${postData.data.postId}`);
    console.log(`IPFS Hash: ${postData.data.ipfsHash}`);
    console.log(`Content: ${postData.data.post.content}`);

    console.log("\n🎉 Quick test completed successfully!\n");
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
    console.error(error);
  } finally {
    rl.close();
  }
}

// Run the main function
main();
