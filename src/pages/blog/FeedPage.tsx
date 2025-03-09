import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Rocket, Zap, TrendingUp, Clock } from "lucide-react";
import { useBlog } from "../../contexts/BlogContext";
import { useWeb3 } from "../../contexts/Web3Context";
import BlogFeed from "../../components/blog/BlogFeed";
import CreatePost from "../../components/blog/CreatePost";

const FeedPage: React.FC = () => {
  const { posts, loading, error, fetchPosts, likePost, createPost } = useBlog();
  const { isProcessing } = useWeb3();
  const [activeTab, setActiveTab] = useState<
    "latest" | "trending" | "following"
  >("latest");
  const [createPostError, setCreatePostError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch posts when the page loads
    fetchPosts();
  }, [fetchPosts]);

  const handleCreatePost = async (content: string, attachments?: File[]) => {
    try {
      setCreatePostError(null);
      const success = await createPost(content, attachments);
      if (!success) {
        setCreatePostError("Failed to create post. Please try again.");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      setCreatePostError("Failed to create post. Please try again.");
    }
  };

  const handleLikePost = async (id: string) => {
    await likePost(id);
  };

  const handleCommentPost = (id: string) => {
    // Navigate to post detail with comment section focused
    window.location.href = `/blog/post/${id}?focusComment=true`;
  };

  const handleSharePost = async (id: string) => {
    try {
      // Copy post URL to clipboard
      const url = `${window.location.origin}/blog/post/${id}`;
      await navigator.clipboard.writeText(url);
      alert("Post URL copied to clipboard!");
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-400 to-dark-300">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Orbit Blocks</h1>
          <p className="text-gray-400">
            Share your thoughts as NFTs on the blockchain.
          </p>
        </motion.div>

        {/* Create Post Section */}
        <div className="mb-10">
          <CreatePost
            onSubmit={handleCreatePost}
            isLoading={isProcessing}
            error={createPostError}
            placeholder="What's on your mind? Create your NFT post..."
          />
        </div>

        {/* Feed Tabs */}
        <div className="mb-8">
          <div className="flex border-b border-white/10">
            <button
              className={`flex items-center py-2 px-4 font-medium transition-all ${
                activeTab === "latest"
                  ? "text-primary-400 border-b-2 border-primary-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("latest")}
            >
              <Clock size={18} className="mr-2" />
              Latest
            </button>
            <button
              className={`flex items-center py-2 px-4 font-medium transition-all ${
                activeTab === "trending"
                  ? "text-primary-400 border-b-2 border-primary-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("trending")}
            >
              <TrendingUp size={18} className="mr-2" />
              Trending
            </button>
            <button
              className={`flex items-center py-2 px-4 font-medium transition-all ${
                activeTab === "following"
                  ? "text-primary-400 border-b-2 border-primary-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("following")}
            >
              <Zap size={18} className="mr-2" />
              Following
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        <BlogFeed
          posts={posts}
          loading={loading}
          error={error || null}
          onLike={handleLikePost}
          onComment={handleCommentPost}
          onShare={handleSharePost}
          loadMore={() => fetchPosts()}
          hasMore={false} // For now, we're not implementing pagination
        />

        {/* No posts state */}
        {!loading && posts.length === 0 && !error && (
          <div className="text-center py-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Rocket size={50} className="text-gray-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">
                No blocks yet
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Be the first to create a block on the Orbit network. Share your
                thoughts, ideas, or artwork as NFTs!
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full text-white font-medium shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300"
              >
                Create Your First Block
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedPage;
