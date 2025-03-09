import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// Import Web3 context for wallet connection
import { useWeb3 } from "./Web3Context";

// Define types
interface Author {
  id: string;
  name: string;
  address: string;
  avatar: string;
  verified: boolean;
}

interface Post {
  id: string;
  tokenId: string;
  content: string;
  author: Author;
  timestamp: string;
  ipfsHash: string;
  likes: number;
  comments: number;
  hasLiked?: boolean;
  isOwned?: boolean;
}

interface Comment {
  id: string;
  content: string;
  author: Author;
  timestamp: string;
  likes: number;
  hasLiked?: boolean;
}

interface BlogContextType {
  posts: Post[];
  myPosts: Post[];
  userPosts: Record<string, Post[]>;
  loading: boolean;
  error: string | null;
  fetchPosts: (refresh?: boolean) => Promise<void>;
  fetchUserPosts: (userId: string) => Promise<Post[]>;
  fetchPost: (id: string) => Promise<Post | null>;
  createPost: (content: string, attachments?: File[]) => Promise<boolean>;
  likePost: (id: string) => Promise<boolean>;
  sharePost: (id: string) => Promise<boolean>;
  fetchComments: (postId: string) => Promise<Comment[]>;
  addComment: (postId: string, content: string) => Promise<boolean>;
  likeComment: (commentId: string) => Promise<boolean>;
}

// Create context
const BlogContext = createContext<BlogContextType | undefined>(undefined);

// Create IPFS client (configure based on your setup)
const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

// Provider component
export const BlogProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [userPosts, setUserPosts] = useState<Record<string, Post[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { account, provider, blogPostContract, blogCommentContract } =
    useWeb3();
  const navigate = useNavigate();

  // Fetch all posts
  const fetchPosts = async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);

      if (!blogPostContract) {
        console.warn("Blog post contract not initialized, using mock data");

        // Mock posts for development when contract isn't available
        const mockPosts: Post[] = [
          {
            id: "post-1",
            tokenId: "1",
            content:
              "This is a mock blog post for testing the UI. The contract isn't connected, but this shows how posts will appear.",
            ipfsHash: "mock-ipfs-hash-1",
            author: {
              id: "user-1",
              name: "Test User",
              address: "0x1234...5678",
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
            content:
              "Here's another mock post. You'll need to connect your wallet with the right network to see real posts and interact with the blockchain.",
            ipfsHash: "mock-ipfs-hash-2",
            author: {
              id: "user-2",
              name: "Orbit Developer",
              address: "0x9876...5432",
              avatar: "",
              verified: true,
            },
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            likes: 10,
            comments: 3,
          },
        ];

        setPosts(mockPosts);
        setLoading(false);
        return;
      }

      // If refresh, clear the posts
      if (refresh) {
        setPosts([]);
      }

      // Fetch total posts count
      const totalPosts = await blogPostContract.getTotalPosts();
      const totalPostsNumber = parseInt(totalPosts.toString());

      if (totalPostsNumber === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Fetch the most recent 20 posts (or fewer if there aren't that many)
      const start = Math.max(1, totalPostsNumber - 19);
      const count = totalPostsNumber - start + 1;

      const postIds = await blogPostContract.getPosts(start, count);

      // Fetch post data for each ID
      const postsData = await Promise.all(
        postIds.map(async (id: any) => {
          try {
            const post = await blogPostContract.getPost(id);

            // Fetch post content from IPFS
            const ipfsHash = post.ipfsHash;
            const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
            const data = await response.json();

            // Check if current user has liked this post
            let hasLiked = false;
            if (account) {
              hasLiked = await blogPostContract.hasLiked(id, account);
            }

            // Fetch comment count
            let commentCount = 0;
            if (blogCommentContract) {
              const comments = await blogCommentContract.getPostComments(id);
              commentCount = comments.length;
            }

            // Create author object
            const author = {
              id: post.author,
              name: data.authorName || `User-${post.author.substring(0, 6)}`,
              address: post.author,
              avatar: data.authorAvatar || "",
              verified: false, // Could be fetched from a verification contract
            };

            return {
              id: id.toString(),
              tokenId: id.toString(),
              content: data.content,
              author,
              timestamp: new Date(post.timestamp * 1000).toISOString(),
              ipfsHash,
              likes: parseInt(post.likesCount.toString()),
              comments: commentCount,
              hasLiked,
              isOwned:
                account && post.author.toLowerCase() === account.toLowerCase(),
            };
          } catch (err) {
            console.error("Error fetching post data:", err);
            return null;
          }
        })
      );

      // Filter out any null posts (failed to load)
      const validPosts = postsData.filter(Boolean) as Post[];

      // Sort posts by timestamp (newest first)
      validPosts.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setPosts(validPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts by a specific user
  const fetchUserPosts = async (userId: string): Promise<Post[]> => {
    try {
      if (!blogPostContract) {
        throw new Error("Blog post contract not initialized");
      }

      // If we already have the user's posts cached, return them
      if (userPosts[userId]) {
        return userPosts[userId];
      }

      // Fetch all posts by the user
      const postIds = await blogPostContract.getUserPosts(userId);

      // Fetch post data for each ID
      const postsData = await Promise.all(
        postIds.map(async (id: any) => {
          try {
            const post = await blogPostContract.getPost(id);

            // Fetch post content from IPFS
            const ipfsHash = post.ipfsHash;
            const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
            const data = await response.json();

            // Check if current user has liked this post
            let hasLiked = false;
            if (account) {
              hasLiked = await blogPostContract.hasLiked(id, account);
            }

            // Fetch comment count
            let commentCount = 0;
            if (blogCommentContract) {
              const comments = await blogCommentContract.getPostComments(id);
              commentCount = comments.length;
            }

            // Create author object
            const author = {
              id: post.author,
              name: data.authorName || `User-${post.author.substring(0, 6)}`,
              address: post.author,
              avatar: data.authorAvatar || "",
              verified: false,
            };

            return {
              id: id.toString(),
              tokenId: id.toString(),
              content: data.content,
              author,
              timestamp: new Date(post.timestamp * 1000).toISOString(),
              ipfsHash,
              likes: parseInt(post.likesCount.toString()),
              comments: commentCount,
              hasLiked,
              isOwned:
                account && post.author.toLowerCase() === account.toLowerCase(),
            };
          } catch (err) {
            console.error("Error fetching post data:", err);
            return null;
          }
        })
      );

      // Filter out any null posts (failed to load)
      const validPosts = postsData.filter(Boolean) as Post[];

      // Sort posts by timestamp (newest first)
      validPosts.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Cache the user's posts
      setUserPosts((prev) => ({
        ...prev,
        [userId]: validPosts,
      }));

      return validPosts;
    } catch (err) {
      console.error("Error fetching user posts:", err);
      throw new Error("Failed to load user posts.");
    }
  };

  // Fetch a specific post by ID
  const fetchPost = async (id: string): Promise<Post | null> => {
    try {
      if (!blogPostContract) {
        throw new Error("Blog post contract not initialized");
      }

      // Check if the post exists in our local state
      const existingPost = posts.find((p) => p.id === id);
      if (existingPost) {
        return existingPost;
      }

      // Fetch the post data from the blockchain
      const post = await blogPostContract.getPost(id);

      // Fetch post content from IPFS
      const ipfsHash = post.ipfsHash;
      const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
      const data = await response.json();

      // Check if current user has liked this post
      let hasLiked = false;
      if (account) {
        hasLiked = await blogPostContract.hasLiked(id, account);
      }

      // Fetch comment count
      let commentCount = 0;
      if (blogCommentContract) {
        const comments = await blogCommentContract.getPostComments(id);
        commentCount = comments.length;
      }

      // Create author object
      const author = {
        id: post.author,
        name: data.authorName || `User-${post.author.substring(0, 6)}`,
        address: post.author,
        avatar: data.authorAvatar || "",
        verified: false,
      };

      return {
        id: id.toString(),
        tokenId: id.toString(),
        content: data.content,
        author,
        timestamp: new Date(post.timestamp * 1000).toISOString(),
        ipfsHash,
        likes: parseInt(post.likesCount.toString()),
        comments: commentCount,
        hasLiked,
        isOwned: account && post.author.toLowerCase() === account.toLowerCase(),
      };
    } catch (err) {
      console.error("Error fetching post:", err);
      return null;
    }
  };

  // Create a new post
  const createPost = async (
    content: string,
    attachments?: File[]
  ): Promise<boolean> => {
    try {
      if (!account || !provider || !blogPostContract) {
        console.warn(
          "Wallet not connected or contracts not initialized, using mock data"
        );

        // Generate a unique ID for the mock post
        const uniqueId = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create a mock post
        const newMockPost: Post = {
          id: uniqueId,
          tokenId: Date.now().toString(),
          content,
          ipfsHash: `mock-ipfs-hash-${Date.now()}`,
          author: {
            id: "current-user",
            name: "You (Mock User)",
            address: account || "0x1234...5678",
            avatar: "",
            verified: true,
          },
          timestamp: new Date().toISOString(),
          likes: 0,
          comments: 0,
          isOwned: true,
        };

        // Update both posts and myPosts arrays
        setPosts((prevPosts) => [newMockPost, ...prevPosts]);
        setMyPosts((prevMyPosts) => [newMockPost, ...prevMyPosts]);

        toast.success("Block created successfully!");
        return true;
      }

      setLoading(true);

      // Prepare metadata for IPFS
      const metadata = {
        content,
        authorName: `User-${account.substring(0, 6)}`, // This could be fetched from a profile contract
        authorAvatar: "", // This could be fetched from a profile contract
        attachments: [],
        timestamp: new Date().toISOString(),
      };

      // Upload attachments to IPFS if any
      if (attachments && attachments.length > 0) {
        const attachmentHashes = await Promise.all(
          attachments.map(async (file) => {
            const fileData = await file.arrayBuffer();
            const fileBuffer = Buffer.from(fileData);
            const result = await ipfs.add(fileBuffer);
            return result.path;
          })
        );

        metadata.attachments = attachmentHashes;
      }

      // Upload metadata to IPFS
      const metadataJSON = JSON.stringify(metadata);
      const metadataBuffer = Buffer.from(metadataJSON);
      const result = await ipfs.add(metadataBuffer);
      const ipfsHash = result.path;

      // Create a signer
      const signer = provider.getSigner();

      // Mint the post as an NFT
      const contract = blogPostContract.connect(signer);
      const tx = await contract.createPost(ipfsHash);

      // Wait for the transaction to be confirmed
      await tx.wait();

      // Create a unique ID for the blockchain post
      const uniqueId = `${tx.hash}-${Date.now()}`;

      // Create a new post object for the UI
      const newPost: Post = {
        id: uniqueId,
        tokenId: tx.hash,
        content: metadata.content,
        author: {
          id: account,
          name: metadata.authorName,
          address: account,
          avatar: metadata.authorAvatar,
          verified: false,
        },
        timestamp: metadata.timestamp,
        ipfsHash,
        likes: 0,
        comments: 0,
        isOwned: true,
      };

      // Add to the posts and myPosts arrays
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      setMyPosts((prevMyPosts) => [newPost, ...prevMyPosts]);

      toast.success("Block created successfully!");

      // We don't need to fetch all posts again as we've already added the new one
      // await fetchPosts(true);

      return true;
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post. Please try again later.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Like a post
  const likePost = async (id: string): Promise<boolean> => {
    try {
      if (!account || !provider || !blogPostContract) {
        throw new Error("Wallet not connected or contracts not initialized");
      }

      // Create a signer
      const signer = provider.getSigner();

      // Connect to the contract with the signer
      const contract = blogPostContract.connect(signer);

      // Check if the user has already liked the post
      const hasLiked = await contract.hasLiked(id, account);

      // Like or unlike based on current state
      let tx;
      if (hasLiked) {
        tx = await contract.unlikePost(id);
      } else {
        tx = await contract.likePost(id);
      }

      // Wait for the transaction to be confirmed
      await tx.wait();

      // Update the posts state
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === id) {
            return {
              ...post,
              likes: hasLiked ? post.likes - 1 : post.likes + 1,
              hasLiked: !hasLiked,
            };
          }
          return post;
        })
      );

      return true;
    } catch (err) {
      console.error("Error liking post:", err);
      return false;
    }
  };

  // Share a post
  const sharePost = async (id: string): Promise<boolean> => {
    try {
      // For now, we'll just copy the post URL to clipboard
      const url = `${window.location.origin}/blog/post/${id}`;
      await navigator.clipboard.writeText(url);
      return true;
    } catch (err) {
      console.error("Error sharing post:", err);
      return false;
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId: string): Promise<Comment[]> => {
    try {
      if (!blogCommentContract) {
        throw new Error("Blog comment contract not initialized");
      }

      // Fetch comment IDs for the post
      const commentIds = await blogCommentContract.getPostComments(postId);

      if (commentIds.length === 0) {
        return [];
      }

      // Fetch comment data for each ID
      const commentsData = await Promise.all(
        commentIds.map(async (id: any) => {
          try {
            const comment = await blogCommentContract.getComment(id);

            // Check if current user has liked this comment
            let hasLiked = false;
            if (account) {
              hasLiked = await blogCommentContract.hasLikedComment(id, account);
            }

            // Create author object
            const author = {
              id: comment.commenter,
              name: `User-${comment.commenter.substring(0, 6)}`, // This could be fetched from a profile contract
              address: comment.commenter,
              avatar: "", // This could be fetched from a profile contract
              verified: false,
            };

            return {
              id: id.toString(),
              content: comment.content,
              author,
              timestamp: new Date(comment.timestamp * 1000).toISOString(),
              likes: parseInt(comment.likesCount.toString()),
              hasLiked,
            };
          } catch (err) {
            console.error("Error fetching comment data:", err);
            return null;
          }
        })
      );

      // Filter out any null comments (failed to load)
      const validComments = commentsData.filter(Boolean) as Comment[];

      // Sort comments by timestamp (newest first)
      validComments.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return validComments;
    } catch (err) {
      console.error("Error fetching comments:", err);
      return [];
    }
  };

  // Add a comment to a post
  const addComment = async (
    postId: string,
    content: string
  ): Promise<boolean> => {
    try {
      if (!account || !provider || !blogCommentContract) {
        throw new Error("Wallet not connected or contracts not initialized");
      }

      // Create a signer
      const signer = provider.getSigner();

      // Connect to the contract with the signer
      const contract = blogCommentContract.connect(signer);

      // Add the comment
      const tx = await contract.addComment(postId, content);

      // Wait for the transaction to be confirmed
      await tx.wait();

      // Update the posts state to increase comment count
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              comments: post.comments + 1,
            };
          }
          return post;
        })
      );

      return true;
    } catch (err) {
      console.error("Error adding comment:", err);
      return false;
    }
  };

  // Like a comment
  const likeComment = async (commentId: string): Promise<boolean> => {
    try {
      if (!account || !provider || !blogCommentContract) {
        throw new Error("Wallet not connected or contracts not initialized");
      }

      // Create a signer
      const signer = provider.getSigner();

      // Connect to the contract with the signer
      const contract = blogCommentContract.connect(signer);

      // Check if the user has already liked the comment
      const hasLiked = await contract.hasLikedComment(commentId, account);

      // Like or unlike based on current state
      let tx;
      if (hasLiked) {
        tx = await contract.unlikeComment(commentId);
      } else {
        tx = await contract.likeComment(commentId);
      }

      // Wait for the transaction to be confirmed
      await tx.wait();

      return true;
    } catch (err) {
      console.error("Error liking comment:", err);
      return false;
    }
  };

  // Fetch user's own posts when account changes
  useEffect(() => {
    const fetchMyPosts = async () => {
      if (account && blogPostContract) {
        try {
          const userPostsData = await fetchUserPosts(account);
          setMyPosts(userPostsData);
        } catch (err) {
          console.error("Error fetching my posts:", err);
        }
      } else if (account && !blogPostContract) {
        // Provide mock data for development when contract isn't initialized
        console.warn("Using mock data for user's posts");

        const mockMyPosts: Post[] = [
          {
            id: "my-post-1",
            tokenId: "101",
            content:
              "This is my created mock post. In development mode, we show this when blockchain connection isn't available.",
            ipfsHash: "mock-ipfs-hash-my-1",
            author: {
              id: "current-user",
              name: "You",
              address: account,
              avatar: "",
              verified: true,
            },
            timestamp: new Date().toISOString(),
            likes: 3,
            comments: 1,
            isOwned: true,
          },
          {
            id: "my-post-2",
            tokenId: "102",
            content:
              "Here's another post I created. You can see all your posts in this section.",
            ipfsHash: "mock-ipfs-hash-my-2",
            author: {
              id: "current-user",
              name: "You",
              address: account,
              avatar: "",
              verified: true,
            },
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            likes: 7,
            comments: 2,
            isOwned: true,
          },
          {
            id: "minted-post-1",
            tokenId: "201",
            content:
              "This is a post I minted from another creator. I own this but didn't create it.",
            ipfsHash: "mock-ipfs-hash-minted-1",
            author: {
              id: "other-user-1",
              name: "Other Creator",
              address: "0xdead...beef",
              avatar: "",
              verified: true,
            },
            timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            likes: 12,
            comments: 3,
            isOwned: true,
          },
        ];

        setMyPosts(mockMyPosts);
      } else {
        setMyPosts([]);
      }
    };

    fetchMyPosts();
  }, [account, blogPostContract]);

  // Fetch posts on initial load
  useEffect(() => {
    if (blogPostContract) {
      fetchPosts();
    }
  }, [blogPostContract]);

  const value = {
    posts,
    myPosts,
    userPosts,
    loading,
    error,
    fetchPosts,
    fetchUserPosts,
    fetchPost,
    createPost,
    likePost,
    sharePost,
    fetchComments,
    addComment,
    likeComment,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

// Custom hook to use the blog context
export const useBlog = (): BlogContextType => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error("useBlog must be used within a BlogProvider");
  }
  return context;
};

export default BlogContext;
