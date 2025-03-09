import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BlogPostPreview from "../../components/blog/BlogPostPreview";
import CreatePost from "../../components/blog/CreatePost";
import { useWeb3 } from "../../contexts/Web3Context";

const TestPage: React.FC = () => {
  const { account, createBlogPost } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mintedPosts, setMintedPosts] = useState<any[]>([]);
  const [userInput, setUserInput] = useState("");

  // Pregenerated demo post
  const demoPosts = [
    {
      id: "demo-1",
      tokenId: "1",
      content: "This is a demo blog post minted as an NFT! #OrbitBlocks #Web3",
      author: {
        name: "Demo User",
        address: "0x1234...5678",
        avatar: "https://api.dicebear.com/6.x/personas/svg?seed=demo",
      },
      timestamp: new Date().toISOString(),
      ipfsHash: "ipfs-mock-hash-123",
      likes: 5,
      comments: 2,
    },
  ];

  // Handle post creation
  const handleCreatePost = async (content: string, attachments?: File[]) => {
    if (!content.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // For demo purposes, create a mock post
      // In production, this would call the actual createBlogPost function

      // Simulate blockchain delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create a new post object
      const newPost = {
        id: `post-${Date.now()}`,
        tokenId: `${mintedPosts.length + 2}`,
        content,
        author: {
          name: account ? `User-${account.substring(0, 6)}` : "Current User",
          address: account || "0xabcd...1234",
          avatar: `https://api.dicebear.com/6.x/personas/svg?seed=${account || "user"}`,
        },
        timestamp: new Date().toISOString(),
        ipfsHash: `ipfs-hash-${Math.floor(Math.random() * 1000)}`,
        likes: 0,
        comments: 0,
      };

      // Add to list of minted posts
      setMintedPosts((prev) => [newPost, ...prev]);

      // Clear input
      setUserInput("");

      return true;
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load any existing posts from local storage
  useEffect(() => {
    const savedPosts = localStorage.getItem("mintedPosts");
    if (savedPosts) {
      try {
        setMintedPosts(JSON.parse(savedPosts));
      } catch (err) {
        console.error("Error loading saved posts:", err);
      }
    }
  }, []);

  // Save posts to local storage when they change
  useEffect(() => {
    if (mintedPosts.length > 0) {
      localStorage.setItem("mintedPosts", JSON.stringify(mintedPosts));
    }
  }, [mintedPosts]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-400 to-dark-300">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Test Minting Blog Posts
          </h1>
          <p className="text-gray-400">
            Create a post and see how it looks when minted as an NFT.
          </p>
        </motion.div>

        {/* Create Post Section */}
        <div className="mb-10">
          <CreatePost
            onSubmit={handleCreatePost}
            isLoading={loading}
            error={error}
            placeholder="Write something to mint as a blog post NFT..."
          />
        </div>

        {/* Post Previews */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">
            Your Minted Posts
          </h2>

          {mintedPosts.length === 0 ? (
            <div className="text-center py-8 bg-black/20 backdrop-blur-md rounded-xl border border-white/5">
              <p className="text-gray-400">
                No posts minted yet. Create your first post above!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {mintedPosts.map((post) => (
                <BlogPostPreview key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Demo Posts */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">Demo Posts</h2>
          <div className="space-y-6">
            {demoPosts.map((post) => (
              <BlogPostPreview key={post.id} post={post} />
            ))}
          </div>
        </div>

        {/* Test Instructions */}
        <div className="p-6 bg-black/30 backdrop-blur-lg rounded-xl border border-white/10">
          <h2 className="text-xl font-bold text-white mb-2">
            Testing Instructions
          </h2>
          <p className="text-gray-400 mb-4">
            This page allows you to test the minting process and preview how
            blog posts look when minted as NFTs.
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2">
            <li>
              Write content in the text area above and click "Mint Post" to
              create a simulated blog post NFT.
            </li>
            <li>
              Your minted posts will appear in the "Your Minted Posts" section.
            </li>
            <li>
              For actual blockchain integration, you would connect your wallet
              and pay gas fees.
            </li>
            <li>The demo posts show how a real minted post would appear.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
