import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Calendar,
  ExternalLink,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import { useBlog } from "../../contexts/BlogContext";
import { useWeb3 } from "../../contexts/Web3Context";
import BlogFeed from "../../components/blog/BlogFeed";

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { fetchUserPosts, likePost } = useBlog();
  const { account } = useWeb3();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    const loadUserPosts = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        // Check if this is the current user's profile
        if (account && userId.toLowerCase() === account.toLowerCase()) {
          setIsCurrentUser(true);
        }

        const userPosts = await fetchUserPosts(userId);
        setPosts(userPosts);
      } catch (err) {
        console.error("Error loading user posts:", err);
        setError("Failed to load user posts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadUserPosts();
  }, [userId, account, fetchUserPosts]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLikePost = async (id: string) => {
    await likePost(id);

    // Update local state
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === id) {
          return {
            ...post,
            hasLiked: !post.hasLiked,
            likes: post.hasLiked ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      })
    );
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

  const handleViewOnBlockchain = () => {
    if (!userId) return;

    // Open blockchain explorer with the user's address
    window.open(`https://etherscan.io/address/${userId}`, "_blank");
  };

  // Get user info from the first post (if available)
  const userInfo = posts.length > 0 ? posts[0].author : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-400 to-dark-300 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 size={40} className="text-primary-500 animate-spin mb-4" />
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-400 to-dark-300">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Back</span>
          </button>
        </div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 p-6 bg-black/30 backdrop-blur-lg rounded-xl border border-white/10 relative overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-600/10 z-0"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full border-4 border-primary-500 overflow-hidden bg-black/50 flex items-center justify-center">
              {userInfo?.avatar ? (
                <img
                  src={userInfo.avatar}
                  alt={userInfo.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-white/70" />
              )}
            </div>

            {/* User Info */}
            <div className="flex-grow text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-2">
                <h1 className="text-2xl font-bold text-white mr-2">
                  {userInfo?.name || `User-${userId?.substring(0, 6)}`}
                </h1>
                {userInfo?.verified && (
                  <BadgeCheck size={20} className="text-primary-400" />
                )}
              </div>

              <p className="text-gray-400 font-mono text-sm mb-4 break-all">
                {userId}
              </p>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center text-gray-300 text-sm">
                  <Calendar size={16} className="mr-1" />
                  <span>
                    Joined{" "}
                    {userInfo
                      ? new Date(userInfo.timestamp).toLocaleDateString()
                      : "Unknown"}
                  </span>
                </div>

                <button
                  onClick={handleViewOnBlockchain}
                  className="flex items-center text-gray-300 text-sm hover:text-primary-400 transition-colors"
                >
                  <ExternalLink size={16} className="mr-1" />
                  <span>View on Blockchain</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* User Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">
              {isCurrentUser ? "Your Posts" : "User Posts"}
            </h2>
            <p className="text-gray-400">
              {posts.length} {posts.length === 1 ? "post" : "posts"} minted as
              NFTs
            </p>
          </div>

          {error ? (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-white/80 transition-all"
              >
                Try Again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-10 bg-black/20 backdrop-blur-md rounded-xl border border-white/5 text-center">
              <User size={40} className="text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                No posts yet
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {isCurrentUser
                  ? "You haven't created any posts yet. Start minting your thoughts as NFTs!"
                  : "This user hasn't created any posts yet."}
              </p>
              {isCurrentUser && (
                <button
                  onClick={() => navigate("/blog")}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full text-white font-medium shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300"
                >
                  Create Your First Post
                </button>
              )}
            </div>
          ) : (
            <BlogFeed
              posts={posts}
              loading={loading}
              error={error}
              onLike={handleLikePost}
              onComment={handleCommentPost}
              onShare={handleSharePost}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfilePage;
