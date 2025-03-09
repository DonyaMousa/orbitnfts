// Test script for blog API endpoints
import fetch from "node-fetch";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const API_BASE_URL = `http://localhost:${process.env.PORT || 5001}/api/blog`;
let authToken = "";
let currentUser = null;

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to prompt user
const prompt = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

// Helper function for API requests
async function apiRequest(endpoint, method = "GET", body = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`API request error: ${error.message}`);
    return { status: 500, data: { success: false, error: error.message } };
  }
}

// Login user
async function login() {
  console.log("\n🔑 Login to get access token");

  // For testing purposes, we'll use a direct API endpoint to login
  // In a real app, you would have proper login functionality
  const email = await prompt("Enter email: ");
  const password = await prompt("Enter password: ");

  try {
    const response = await fetch(
      `http://localhost:${process.env.PORT || 5001}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const result = await response.json();

    if (result.success && result.token) {
      authToken = result.token;
      currentUser = result.data;
      console.log(
        `✅ Login successful! User: ${currentUser.username || currentUser.email}`
      );
      return true;
    } else {
      console.log(`❌ Login failed: ${result.error || "Unknown error"}`);

      // For testing purposes, let's create a mock token
      const useMockToken = await prompt(
        "Do you want to continue with a mock token? (y/n): "
      );
      if (useMockToken.toLowerCase() === "y") {
        authToken = "mock-token-for-testing";
        currentUser = {
          id: "123",
          walletAddress: "0x123...",
          username: "Test User",
        };
        console.log("Using mock token for testing.");
        return true;
      }
      return false;
    }
  } catch (error) {
    console.error(`Login error: ${error.message}`);

    // For testing purposes, let's create a mock token
    const useMockToken = await prompt(
      "Do you want to continue with a mock token? (y/n): "
    );
    if (useMockToken.toLowerCase() === "y") {
      authToken = "mock-token-for-testing";
      currentUser = {
        id: "123",
        walletAddress: "0x123...",
        username: "Test User",
      };
      console.log("Using mock token for testing.");
      return true;
    }
    return false;
  }
}

// Test creating a blog post
async function createBlogPost() {
  console.log("\n📝 Testing: Create Blog Post");

  const content = await prompt("Enter post content: ");

  console.log("Creating blog post...");
  const { status, data } = await apiRequest("/post", "POST", { content });

  if (status === 201 && data.success) {
    console.log(`✅ Post created successfully!`);
    console.log(`Post ID: ${data.data.postId}`);
    console.log(`IPFS Hash: ${data.data.ipfsHash}`);
    return data.data;
  } else {
    console.log(`❌ Failed to create post: ${data.error || "Unknown error"}`);
    console.log(`Status code: ${status}`);

    // If unauthorized, prompt for login
    if (status === 401) {
      console.log("Token is invalid or expired. Please login again.");
      await login();
      return createBlogPost();
    }
    return null;
  }
}

// Test getting blog posts
async function getBlogPosts() {
  console.log("\n📋 Testing: Get Blog Posts");

  console.log("Fetching posts...");
  const { status, data } = await apiRequest("/posts");

  if (status === 200 && data.success) {
    console.log(`✅ Retrieved ${data.data.posts.length} posts`);
    console.log(`Total posts: ${data.data.totalPosts}`);

    if (data.data.posts.length > 0) {
      console.log("\nLatest post:");
      const latestPost = data.data.posts[0];
      console.log(`ID: ${latestPost.id}`);
      console.log(`Content: ${latestPost.content}`);
      console.log(`Author: ${latestPost.author.name}`);
      console.log(`Likes: ${latestPost.likes}`);
      console.log(`Comments: ${latestPost.comments}`);
    }

    return data.data.posts;
  } else {
    console.log(`❌ Failed to get posts: ${data.error || "Unknown error"}`);
    console.log(`Status code: ${status}`);
    return [];
  }
}

// Test getting a specific post
async function getBlogPost(postId) {
  console.log(`\n🔍 Testing: Get Blog Post (ID: ${postId})`);

  console.log("Fetching post...");
  const { status, data } = await apiRequest(`/post/${postId}`);

  if (status === 200 && data.success) {
    console.log(`✅ Retrieved post`);
    console.log(`ID: ${data.data.id}`);
    console.log(`Content: ${data.data.content}`);
    console.log(`Author: ${data.data.author.name}`);
    console.log(`Likes: ${data.data.likes}`);
    console.log(`Comments: ${data.data.comments}`);
    return data.data;
  } else {
    console.log(`❌ Failed to get post: ${data.error || "Unknown error"}`);
    console.log(`Status code: ${status}`);
    return null;
  }
}

// Test liking a post
async function likePost(postId) {
  console.log(`\n❤️ Testing: Like Post (ID: ${postId})`);

  console.log("Liking post...");
  const { status, data } = await apiRequest(`/post/${postId}/like`, "POST");

  if (status === 200 && data.success) {
    console.log(
      `✅ Post ${data.data.liked ? "liked" : "unliked"} successfully`
    );
    console.log(`Updated like count: ${data.data.likes}`);
    return data.data;
  } else {
    console.log(`❌ Failed to like post: ${data.error || "Unknown error"}`);
    console.log(`Status code: ${status}`);

    // If unauthorized, prompt for login
    if (status === 401) {
      console.log("Token is invalid or expired. Please login again.");
      await login();
      return likePost(postId);
    }
    return null;
  }
}

// Test commenting on a post
async function commentOnPost(postId) {
  console.log(`\n💬 Testing: Comment on Post (ID: ${postId})`);

  const content = await prompt("Enter comment content: ");

  console.log("Adding comment...");
  const { status, data } = await apiRequest(`/post/${postId}/comment`, "POST", {
    content,
  });

  if (status === 201 && data.success) {
    console.log(`✅ Comment added successfully`);
    console.log(`Comment ID: ${data.data.id}`);
    console.log(`Content: ${data.data.content}`);
    return data.data;
  } else {
    console.log(`❌ Failed to add comment: ${data.error || "Unknown error"}`);
    console.log(`Status code: ${status}`);

    // If unauthorized, prompt for login
    if (status === 401) {
      console.log("Token is invalid or expired. Please login again.");
      await login();
      return commentOnPost(postId);
    }
    return null;
  }
}

// Test getting comments for a post
async function getPostComments(postId) {
  console.log(`\n📋 Testing: Get Comments for Post (ID: ${postId})`);

  console.log("Fetching comments...");
  const { status, data } = await apiRequest(`/post/${postId}/comments`);

  if (status === 200 && data.success) {
    console.log(`✅ Retrieved ${data.data.length} comments`);

    if (data.data.length > 0) {
      console.log("\nLatest comment:");
      const latestComment = data.data[0];
      console.log(`ID: ${latestComment.id}`);
      console.log(`Content: ${latestComment.content}`);
      console.log(`Author: ${latestComment.author.name}`);
      console.log(`Likes: ${latestComment.likes}`);
    }

    return data.data;
  } else {
    console.log(`❌ Failed to get comments: ${data.error || "Unknown error"}`);
    console.log(`Status code: ${status}`);
    return [];
  }
}

// Test getting user posts
async function getUserPosts(walletAddress) {
  console.log(`\n👤 Testing: Get User Posts (Address: ${walletAddress})`);

  console.log("Fetching user posts...");
  const { status, data } = await apiRequest(`/user/${walletAddress}/posts`);

  if (status === 200 && data.success) {
    console.log(`✅ Retrieved ${data.data.length} posts for user`);

    if (data.data.length > 0) {
      console.log("\nLatest user post:");
      const latestPost = data.data[0];
      console.log(`ID: ${latestPost.id}`);
      console.log(`Content: ${latestPost.content}`);
      console.log(`Likes: ${latestPost.likes}`);
      console.log(`Comments: ${latestPost.comments}`);
    }

    return data.data;
  } else {
    console.log(
      `❌ Failed to get user posts: ${data.error || "Unknown error"}`
    );
    console.log(`Status code: ${status}`);
    return [];
  }
}

// Main test flow
async function runTests() {
  console.log("\n🚀 Starting Blog API Tests");

  // Login first
  const loggedIn = await login();
  if (!loggedIn) {
    console.log("❌ Cannot proceed without authentication.");
    rl.close();
    return;
  }

  // Create a new post
  const createdPost = await createBlogPost();

  if (createdPost) {
    // Get all posts
    await getBlogPosts();

    // Get the specific post
    await getBlogPost(createdPost.postId);

    // Like the post
    await likePost(createdPost.postId);

    // Comment on the post
    const comment = await commentOnPost(createdPost.postId);

    // Get comments for the post
    await getPostComments(createdPost.postId);

    // Get user posts
    if (currentUser && currentUser.walletAddress) {
      await getUserPosts(currentUser.walletAddress);
    } else {
      console.log("\n⚠️ Cannot test user posts without wallet address");
    }
  }

  console.log("\n✅ All tests completed!");
  rl.close();
}

// Run the tests
runTests().catch((err) => {
  console.error("Test error:", err);
  rl.close();
});
