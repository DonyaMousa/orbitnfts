import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2,
  Rocket,
  Filter,
  Plus,
  BookMarked,
  BookOpen,
} from "lucide-react";
import { useBlog } from "../../contexts/BlogContext";
import { useWeb3 } from "../../contexts/Web3Context";
import BlogFeed from "../../components/blog/BlogFeed";
import CreatePost from "../../components/blog/CreatePost";
import { toast } from "react-hot-toast";

const MyPostsPage: React.FC = () => {
  const navigate = useNavigate();
  const { myPosts, loading, error, fetchPosts, likePost, createPost } =
    useBlog();
  const { account, isProcessing } = useWeb3();
  const [tab, setTab] = useState<"created" | "minted">("created");
  const [createPostError, setCreatePostError] = useState<string | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostId, setNewPostId] = useState<string>("");

  useEffect(() => {
    // Check if user is logged in
    if (!account) {
      navigate("/");
    }

    // Fetch the user's posts when the component mounts
    fetchPosts();
  }, [account, fetchPosts, navigate]);

  const handleCreatePost = async (content: string, attachments?: File[]) => {
    try {
      setCreatePostError(null);
      const success = await createPost(content, attachments);
      if (!success) {
        setCreatePostError("Failed to create post. Please try again.");
      } else {
        // Get the ID of the newly created post (assuming it's the first in myPosts after creation)
        if (myPosts.length > 0) {
          setNewPostId(myPosts[0].id);

          // Clear the new post ID after 10 seconds
          setTimeout(() => {
            setNewPostId("");
          }, 10000);
        }

        setShowCreatePost(false); // Hide create post form after successful post
        setTab("created"); // Switch to created tab after posting

        // Show a visual confirmation that stays within the page
        toast.success(
          "Your block has been created and added to your collection!",
          {
            icon: "🚀",
            duration: 5000,
          }
        );
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
    navigate(`/blog/post/${id}?focusComment=true`);
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

  // Filter posts based on the active tab
  const filteredPosts = myPosts.filter((post) => {
    if (tab === "created") {
      return (
        post.isOwned &&
        post.author.address.toLowerCase() === account?.toLowerCase()
      );
    } else {
      // minted
      return (
        post.isOwned &&
        post.author.address.toLowerCase() !== account?.toLowerCase()
      );
    }
  });

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
            My Orbit Blocks
          </h1>
          <p className="text-gray-400">
            Manage your created and minted NFT blog posts
          </p>
        </motion.div>

        {/* Toggle Create Post Form */}
        {!showCreatePost ? (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowCreatePost(true)}
            className="mb-6 flex items-center justify-center w-full py-3 px-4 bg-dark-500 hover:bg-dark-600 rounded-xl border border-white/10 text-white font-medium transition-all"
          >
            <Plus size={20} className="mr-2" />
            Create New Block
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <CreatePost
              onSubmit={handleCreatePost}
              isLoading={isProcessing}
              error={createPostError}
              placeholder="What's on your mind? Create your NFT post..."
              onCancel={() => setShowCreatePost(false)}
            />
          </motion.div>
        )}

        {/* Tabs for filtering */}
        <div className="mb-8 border-b border-white/10">
          <div className="flex">
            <button
              className={`flex items-center py-3 px-4 font-medium transition-all ${
                tab === "created"
                  ? "text-primary-400 border-b-2 border-primary-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setTab("created")}
            >
              <BookOpen size={18} className="mr-2" />
              Created Posts
            </button>
            <button
              className={`flex items-center py-3 px-4 font-medium transition-all ${
                tab === "minted"
                  ? "text-primary-400 border-b-2 border-primary-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setTab("minted")}
            >
              <BookMarked size={18} className="mr-2" />
              Minted Blocks
            </button>
          </div>
        </div>

        {/* Posts feed */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={40} className="animate-spin text-primary-500" />
          </div>
        ) : filteredPosts.length > 0 ? (
          <BlogFeed
            posts={filteredPosts}
            loading={loading}
            error={error}
            onLike={handleLikePost}
            onComment={handleCommentPost}
            onShare={handleSharePost}
            loadMore={() => {}}
            hasMore={false}
            newPostId={newPostId}
          />
        ) : (
          <div className="text-center py-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Rocket size={50} className="text-gray-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">
                No {tab === "created" ? "created" : "minted"} blocks yet
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {tab === "created"
                  ? "You haven't created any blocks yet. Share your thoughts, ideas, or artwork as NFTs!"
                  : "You haven't minted any blocks from other creators yet. Explore the feed to discover content!"}
              </p>
              {tab === "created" ? (
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full text-white font-medium shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300"
                >
                  Create Your First Block
                </button>
              ) : (
                <button
                  onClick={() => navigate("/blog")}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full text-white font-medium shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300"
                >
                  Explore Blocks
                </button>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPostsPage;
