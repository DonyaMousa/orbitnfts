import express from "express";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";
import { authenticateToken, bypassAuth } from "../middleware/auth.js";
import BlogPost from "../contracts/BlogPost.json" assert { type: "json" };
import BlogComment from "../contracts/BlogComment.json" assert { type: "json" };
import {
  emitToFeed,
  emitToPost,
  emitToUser,
} from "../services/socketService.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Configure IPFS client with error handling
let ipfs;
try {
  // Check if IPFS credentials are available
  if (
    process.env.INFURA_IPFS_PROJECT_ID &&
    process.env.INFURA_IPFS_PROJECT_SECRET
  ) {
    ipfs = create({
      host: "ipfs.infura.io",
      port: 5001,
      protocol: "https",
      headers: {
        authorization: `Basic ${Buffer.from(
          process.env.INFURA_IPFS_PROJECT_ID +
            ":" +
            process.env.INFURA_IPFS_PROJECT_SECRET
        ).toString("base64")}`,
      },
    });
    console.log("IPFS client initialized successfully");
  } else {
    console.warn("IPFS credentials not found, using mock IPFS functionality");
    // Create a mock IPFS client for development/testing
    ipfs = {
      add: async (data) => {
        console.log("Mock IPFS: Storing data", data.length, "bytes");
        return { path: `ipfs-mock-hash-${Date.now()}` };
      },
    };
  }
} catch (error) {
  console.error("Error initializing IPFS client:", error);
  // Fallback to mock IPFS
  ipfs = {
    add: async (data) => {
      console.log("Mock IPFS: Storing data", data.length, "bytes");
      return { path: `ipfs-mock-hash-${Date.now()}` };
    },
  };
}

// Get provider with better error handling
const getProvider = () => {
  try {
    // Check if using test network
    if (process.env.USE_TEST_NETWORK === "true") {
      console.log("Using local test network for Ethereum provider");
      return new ethers.providers.JsonRpcProvider(
        process.env.LOCAL_RPC_URL || "http://localhost:8545"
      );
    }

    // Check if Infura project ID is available
    if (process.env.INFURA_PROJECT_ID) {
      console.log("Using Infura provider for Ethereum");
      return new ethers.providers.InfuraProvider(
        process.env.ETHEREUM_NETWORK || "sepolia",
        process.env.INFURA_PROJECT_ID
      );
    }

    console.warn(
      "No provider configuration found. Using fallback local provider for development."
    );
    return new ethers.providers.JsonRpcProvider("http://localhost:8545");
  } catch (error) {
    console.error("Error creating Ethereum provider:", error);
    throw new Error("Failed to initialize blockchain provider");
  }
};

// Get blog contracts with better error handling
const getBlogContracts = () => {
  try {
    const provider = getProvider();

    // Use environment variables or fallback to hardcoded test addresses
    const blogPostAddress =
      process.env.BLOG_POST_CONTRACT_ADDRESS ||
      "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const blogCommentAddress =
      process.env.BLOG_COMMENT_CONTRACT_ADDRESS ||
      "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

    console.log("Using blog post contract address:", blogPostAddress);
    console.log("Using blog comment contract address:", blogCommentAddress);

    // Create contract instances
    const blogPostContract = new ethers.Contract(
      blogPostAddress,
      BlogPost.abi,
      provider
    );

    const blogCommentContract = new ethers.Contract(
      blogCommentAddress,
      BlogComment.abi,
      provider
    );

    return { blogPostContract, blogCommentContract };
  } catch (error) {
    console.error("Failed to initialize blog contracts:", error);
    return { blogPostContract: null, blogCommentContract: null };
  }
};

// Create a new blog post - Use bypassAuth for development/testing
// For production, change back to authenticateToken
router.post("/post", bypassAuth, async (req, res) => {
  try {
    const { content, attachments = [] } = req.body;
    const { userId, walletAddress } = req.user;

    if (!content || content.trim() === "") {
      return res
        .status(400)
        .json({ success: false, error: "Content is required" });
    }

    // Prepare metadata
    const metadata = {
      content,
      authorName: req.user.username || `User-${walletAddress.substring(0, 6)}`,
      authorAvatar: req.user.avatar || "",
      attachments: [],
      userId,
      timestamp: new Date().toISOString(),
    };

    // Process attachments
    if (attachments.length > 0) {
      // In a real implementation, this would handle file uploads
      // For now, just use URLs if they're provided
      metadata.attachments = attachments;
    }

    // Upload to IPFS with error handling
    let ipfsHash;
    try {
      const metadataBuffer = Buffer.from(JSON.stringify(metadata));
      const result = await ipfs.add(metadataBuffer);
      ipfsHash = result.path;
      console.log(`Successfully uploaded to IPFS with hash: ${ipfsHash}`);
    } catch (ipfsError) {
      console.error("IPFS upload failed:", ipfsError);
      // Use a mock hash for development/testing
      ipfsHash = `ipfs-mock-hash-${Date.now()}`;
      console.log(`Using mock IPFS hash: ${ipfsHash}`);
    }

    try {
      // Get signer for blockchain interaction
      const { blogPostContract, provider } = getBlogContracts();
      const privateKey = process.env.SERVER_PRIVATE_KEY;

      // Check if private key is available
      if (!privateKey) {
        throw new Error("Server private key not found");
      }

      const wallet = new ethers.Wallet(privateKey, provider);
      const contractWithSigner = blogPostContract.connect(wallet);

      // Estimate gas price
      const gasPrice = await provider.getGasPrice();
      const adjustedGasPrice = gasPrice.mul(120).div(100); // 20% more to ensure transaction goes through

      // Create post on blockchain
      const tx = await contractWithSigner.createPost(ipfsHash, {
        gasPrice: adjustedGasPrice,
      });
      const receipt = await tx.wait();

      // Get the token ID from the event
      const event = receipt.events?.find((e) => e.event === "PostCreated");
      const tokenId = event?.args?.tokenId.toString();

      // Prepare response data
      const postData = {
        id: tokenId,
        tokenId,
        content,
        author: {
          id: walletAddress,
          name: metadata.authorName,
          address: walletAddress,
          avatar: metadata.authorAvatar,
          verified: false,
        },
        timestamp: metadata.timestamp,
        ipfsHash,
        likes: 0,
        comments: 0,
        hasLiked: false,
        isOwned: true,
      };

      // Emit socket event for real-time updates
      try {
        emitToFeed("new-post", postData);
      } catch (socketError) {
        console.error("Socket emission error:", socketError);
        // Continue even if socket emission fails
      }

      return res.status(201).json({
        success: true,
        data: {
          postId: tokenId,
          ipfsHash,
          post: postData,
        },
        message: "Post created successfully",
      });
    } catch (blockchainError) {
      console.error("Blockchain interaction error:", blockchainError);

      // For development/testing, provide a mock response
      if (process.env.NODE_ENV !== "production") {
        const mockTokenId = `mock-${Date.now()}`;
        const mockPostData = {
          id: mockTokenId,
          tokenId: mockTokenId,
          content,
          author: {
            id: walletAddress || "0x1234567890123456789012345678901234567890",
            name: req.user.username || "Test User",
            address:
              walletAddress || "0x1234567890123456789012345678901234567890",
            avatar: req.user.avatar || "",
            verified: false,
          },
          timestamp: new Date().toISOString(),
          ipfsHash,
          likes: 0,
          comments: 0,
          hasLiked: false,
          isOwned: true,
        };

        console.log("Returning mock post data for development:", mockTokenId);

        return res.status(201).json({
          success: true,
          data: {
            postId: mockTokenId,
            ipfsHash,
            post: mockPostData,
          },
          message:
            "Post created successfully (MOCK - blockchain interaction skipped)",
        });
      }

      throw blockchainError;
    }
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create post: " + (error.message || "Unknown error"),
    });
  }
});

// Get posts
router.get("/posts", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { blogPostContract } = getBlogContracts();

    // Get total number of posts
    const totalPosts = await blogPostContract.getTotalPosts();
    const totalPostsNumber = parseInt(totalPosts.toString());

    if (totalPostsNumber === 0) {
      return res.status(200).json({
        success: true,
        data: {
          posts: [],
          totalPosts: 0,
          hasMore: false,
        },
      });
    }

    // Calculate start index for pagination
    const start = Math.max(1, totalPostsNumber - page * limit + 1);
    const count = Math.min(limit, totalPostsNumber - start + 1);

    if (start > totalPostsNumber) {
      return res.status(200).json({
        success: true,
        data: {
          posts: [],
          totalPosts: totalPostsNumber,
          hasMore: false,
        },
      });
    }

    // Get posts
    const postIds = await blogPostContract.getPosts(start, count);

    // Get post data
    const postsPromises = postIds.map(async (id) => {
      const post = await blogPostContract.getPost(id);

      // Get IPFS data
      let postData = { content: "", authorName: "", authorAvatar: "" };
      try {
        const ipfsUrl = `https://ipfs.io/ipfs/${post.ipfsHash}`;
        const response = await fetch(ipfsUrl);
        postData = await response.json();
      } catch (error) {
        console.error(`Error fetching IPFS data for post ${id}:`, error);
      }

      return {
        id: id.toString(),
        tokenId: id.toString(),
        content: postData.content,
        author: {
          id: post.author,
          name: postData.authorName || `User-${post.author.substring(0, 6)}`,
          address: post.author,
          avatar: postData.authorAvatar || "",
          verified: false,
        },
        timestamp: new Date(post.timestamp * 1000).toISOString(),
        ipfsHash: post.ipfsHash,
        likes: parseInt(post.likesCount.toString()),
        comments: 0, // We'll get this in a real implementation
      };
    });

    const posts = await Promise.all(postsPromises);

    // Sort by timestamp (newest first)
    posts.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return res.status(200).json({
      success: true,
      data: {
        posts,
        totalPosts: totalPostsNumber,
        hasMore: start > 1,
      },
    });
  } catch (error) {
    console.error("Error getting posts:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get posts",
    });
  }
});

// Get post by ID
router.get("/post/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { blogPostContract, blogCommentContract } = getBlogContracts();

    // Get post data
    const post = await blogPostContract.getPost(id);

    // Get IPFS data
    let postData = { content: "", authorName: "", authorAvatar: "" };
    try {
      const ipfsUrl = `https://ipfs.io/ipfs/${post.ipfsHash}`;
      const response = await fetch(ipfsUrl);
      postData = await response.json();
    } catch (error) {
      console.error(`Error fetching IPFS data for post ${id}:`, error);
    }

    // Get comments count
    let commentsCount = 0;
    try {
      const comments = await blogCommentContract.getPostComments(id);
      commentsCount = comments.length;
    } catch (error) {
      console.error(`Error getting comments for post ${id}:`, error);
    }

    const postWithData = {
      id: id.toString(),
      tokenId: id.toString(),
      content: postData.content,
      author: {
        id: post.author,
        name: postData.authorName || `User-${post.author.substring(0, 6)}`,
        address: post.author,
        avatar: postData.authorAvatar || "",
        verified: false,
      },
      timestamp: new Date(post.timestamp * 1000).toISOString(),
      ipfsHash: post.ipfsHash,
      likes: parseInt(post.likesCount.toString()),
      comments: commentsCount,
    };

    return res.status(200).json({
      success: true,
      data: postWithData,
    });
  } catch (error) {
    console.error("Error getting post:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get post",
    });
  }
});

// Like a post
router.post("/post/:id/like", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { walletAddress } = req.user;

    const { blogPostContract, provider } = getBlogContracts();

    // Check if user has already liked the post
    const hasLiked = await blogPostContract.hasLiked(id, walletAddress);

    // Get signer
    const privateKey = process.env.SERVER_PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    const contractWithSigner = blogPostContract.connect(wallet);

    // Like or unlike
    let tx;
    if (hasLiked) {
      tx = await contractWithSigner.unlikePost(id);
    } else {
      tx = await contractWithSigner.likePost(id);
    }
    await tx.wait();

    // Get updated post data
    const post = await blogPostContract.getPost(id);
    const updatedLikes = parseInt(post.likesCount.toString());

    // Emit socket event for real-time updates
    emitToFeed("post-like-update", {
      postId: id,
      likes: updatedLikes,
      liker: walletAddress,
      hasLiked: !hasLiked,
    });

    // Also emit to the specific post room
    emitToPost(id, "post-like-update", {
      postId: id,
      likes: updatedLikes,
      liker: walletAddress,
      hasLiked: !hasLiked,
    });

    return res.status(200).json({
      success: true,
      data: {
        liked: !hasLiked,
        likes: updatedLikes,
      },
      message: hasLiked
        ? "Post unliked successfully"
        : "Post liked successfully",
    });
  } catch (error) {
    console.error("Error liking post:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to like post",
    });
  }
});

// Add a comment
router.post("/post/:id/comment", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const { walletAddress, userId } = req.user;

    if (!content || content.trim() === "") {
      return res
        .status(400)
        .json({ success: false, error: "Content is required" });
    }

    const { blogCommentContract, provider } = getBlogContracts();

    // Get signer
    const privateKey = process.env.SERVER_PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    const contractWithSigner = blogCommentContract.connect(wallet);

    // Add comment
    const tx = await contractWithSigner.addComment(id, content);
    const receipt = await tx.wait();

    // Get comment ID from event
    const event = receipt.events?.find((e) => e.event === "CommentAdded");
    const commentId = event?.args?.commentId.toString();

    // Prepare comment data
    const commentData = {
      id: commentId,
      content,
      author: {
        id: walletAddress,
        name: req.user.username || `User-${walletAddress.substring(0, 6)}`,
        address: walletAddress,
        avatar: req.user.avatar || "",
        verified: false,
      },
      timestamp: new Date().toISOString(),
      likes: 0,
      hasLiked: false,
    };

    // Emit socket event for real-time updates
    emitToPost(id, "new-comment", {
      postId: id,
      comment: commentData,
    });

    // Also emit to the post owner if different from commenter
    const { blogPostContract } = getBlogContracts();
    const post = await blogPostContract.getPost(id);
    const postOwner = post.author;

    if (postOwner.toLowerCase() !== walletAddress.toLowerCase()) {
      // Notify post owner of the new comment
      emitToUser(postOwner, "post-notification", {
        type: "comment",
        postId: id,
        comment: commentData,
      });
    }

    return res.status(201).json({
      success: true,
      data: commentData,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to add comment",
    });
  }
});

// Get comments for a post
router.get("/post/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const { blogCommentContract } = getBlogContracts();

    // Get comment IDs
    const commentIds = await blogCommentContract.getPostComments(id);

    if (commentIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Get comment data
    const commentsPromises = commentIds.map(async (commentId) => {
      const comment = await blogCommentContract.getComment(commentId);

      return {
        id: commentId.toString(),
        content: comment.content,
        author: {
          id: comment.commenter,
          name: `User-${comment.commenter.substring(0, 6)}`,
          address: comment.commenter,
          avatar: "",
          verified: false,
        },
        timestamp: new Date(comment.timestamp * 1000).toISOString(),
        likes: parseInt(comment.likesCount.toString()),
      };
    });

    const comments = await Promise.all(commentsPromises);

    // Sort by timestamp (newest first)
    comments.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("Error getting comments:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get comments",
    });
  }
});

// Like a comment
router.post("/comment/:id/like", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { walletAddress } = req.user;

    const { blogCommentContract, provider } = getBlogContracts();

    // Check if user has already liked the comment
    const hasLiked = await blogCommentContract.hasLikedComment(
      id,
      walletAddress
    );

    // Get signer
    const privateKey = process.env.SERVER_PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    const contractWithSigner = blogCommentContract.connect(wallet);

    // Like or unlike
    let tx;
    if (hasLiked) {
      tx = await contractWithSigner.unlikeComment(id);
    } else {
      tx = await contractWithSigner.likeComment(id);
    }
    await tx.wait();

    // Get updated comment data
    const comment = await blogCommentContract.getComment(id);
    const updatedLikes = parseInt(comment.likesCount.toString());
    const postId = comment.postId.toString();

    // Emit socket event for real-time updates
    emitToPost(postId, "comment-like-update", {
      commentId: id,
      likes: updatedLikes,
      liker: walletAddress,
      hasLiked: !hasLiked,
    });

    return res.status(200).json({
      success: true,
      data: {
        liked: !hasLiked,
        likes: updatedLikes,
      },
      message: hasLiked
        ? "Comment unliked successfully"
        : "Comment liked successfully",
    });
  } catch (error) {
    console.error("Error liking comment:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to like comment",
    });
  }
});

// Get user posts
router.get("/user/:address/posts", async (req, res) => {
  try {
    const { address } = req.params;
    const { blogPostContract, blogCommentContract } = getBlogContracts();

    // Get post IDs
    const postIds = await blogPostContract.getUserPosts(address);

    if (postIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Get post data
    const postsPromises = postIds.map(async (id) => {
      const post = await blogPostContract.getPost(id);

      // Get IPFS data
      let postData = { content: "", authorName: "", authorAvatar: "" };
      try {
        const ipfsUrl = `https://ipfs.io/ipfs/${post.ipfsHash}`;
        const response = await fetch(ipfsUrl);
        postData = await response.json();
      } catch (error) {
        console.error(`Error fetching IPFS data for post ${id}:`, error);
      }

      // Get comments count
      let commentsCount = 0;
      try {
        const comments = await blogCommentContract.getPostComments(id);
        commentsCount = comments.length;
      } catch (error) {
        console.error(`Error getting comments for post ${id}:`, error);
      }

      return {
        id: id.toString(),
        tokenId: id.toString(),
        content: postData.content,
        author: {
          id: address,
          name: postData.authorName || `User-${address.substring(0, 6)}`,
          address: address,
          avatar: postData.authorAvatar || "",
          verified: false,
        },
        timestamp: new Date(post.timestamp * 1000).toISOString(),
        ipfsHash: post.ipfsHash,
        likes: parseInt(post.likesCount.toString()),
        comments: commentsCount,
      };
    });

    const posts = await Promise.all(postsPromises);

    // Sort by timestamp (newest first)
    posts.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error("Error getting user posts:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get user posts",
    });
  }
});

// API route for fetching all blog posts (fallback for development)
router.get("/posts", async (req, res) => {
  try {
    // Mock data for development
    const mockPosts = [
      {
        id: "post-1",
        tokenId: "1",
        content: "This is a mock blog post #1 for development",
        ipfsHash: "mock-ipfs-hash-1",
        author: {
          id: "user-1",
          name: "Test User",
          address: "0x123...456",
          avatar: "",
          verified: true,
        },
        timestamp: new Date().toISOString(),
        likes: 5,
        comments: 2,
      },
      {
        id: "post-2",
        tokenId: "2",
        content: "This is a mock blog post #2 for development",
        ipfsHash: "mock-ipfs-hash-2",
        author: {
          id: "user-1",
          name: "Test User",
          address: "0x123...456",
          avatar: "",
          verified: true,
        },
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        likes: 3,
        comments: 1,
      },
    ];

    return res.status(200).json({
      success: true,
      posts: mockPosts,
    });
  } catch (error) {
    console.error("Error fetching mock posts:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch posts",
      details: error.message,
    });
  }
});

// API route for creating a blog post (fallback for development)
router.post("/post", authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: "Content is required for blog post",
      });
    }

    // Generate a mock IPFS hash
    const mockIpfsHash = `mock-ipfs-hash-${Date.now()}`;

    // Create a mock post
    const mockPost = {
      id: `post-${Date.now()}`,
      tokenId: `${Date.now()}`,
      content,
      ipfsHash: mockIpfsHash,
      author: {
        id: req.user.id || "user-1",
        name: req.user.username || "Test User",
        address: req.user.address || "0x123...456",
        avatar: "",
        verified: true,
      },
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
    };

    console.log("Created mock blog post:", mockPost);

    return res.status(201).json({
      success: true,
      post: mockPost,
    });
  } catch (error) {
    console.error("Error creating mock post:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create post",
      details: error.message,
    });
  }
});

export default router;
