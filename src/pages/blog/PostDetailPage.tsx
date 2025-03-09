import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Copy, Check, Share2 } from "lucide-react";
import { useBlog } from "../../contexts/BlogContext";
import BlogPost from "../../components/blog/BlogPost";
import CommentSection from "../../components/blog/CommentSection";

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchPost, fetchComments, likePost, addComment, likeComment } =
    useBlog();

  const [post, setPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Check if we should focus on the comment section
  const shouldFocusComment =
    new URLSearchParams(location.search).get("focusComment") === "true";

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const postData = await fetchPost(id);
        if (!postData) {
          setError("Post not found");
          return;
        }

        setPost(postData);

        // Load comments
        const commentsData = await fetchComments(id);
        setComments(commentsData);
      } catch (err) {
        console.error("Error loading post:", err);
        setError("Failed to load post. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, fetchPost, fetchComments]);

  useEffect(() => {
    // Scroll to comments if needed
    if (shouldFocusComment && !loading && post) {
      const commentsSection = document.getElementById("comments-section");
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [shouldFocusComment, loading, post]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLikePost = async (postId: string) => {
    if (!post) return;

    try {
      await likePost(postId);
      // Update local state
      setPost({
        ...post,
        hasLiked: !post.hasLiked,
        likes: post.hasLiked ? post.likes - 1 : post.likes + 1,
      });
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    if (!post) return;

    try {
      setCommentLoading(true);
      setCommentError(null);

      const success = await addComment(postId, content);
      if (!success) {
        setCommentError("Failed to add comment. Please try again.");
        return;
      }

      // Refresh comments
      const commentsData = await fetchComments(id || "");
      setComments(commentsData);

      // Update post comment count
      setPost({
        ...post,
        comments: post.comments + 1,
      });
    } catch (err) {
      console.error("Error adding comment:", err);
      setCommentError("Failed to add comment. Please try again.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await likeComment(commentId);

      // Update local state
      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              hasLiked: !comment.hasLiked,
              likes: comment.hasLiked ? comment.likes - 1 : comment.likes + 1,
            };
          }
          return comment;
        })
      );
    } catch (err) {
      console.error("Error liking comment:", err);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copying link:", err);
    }
  };

  const handleViewOnBlockchain = () => {
    if (!post) return;

    // Open blockchain explorer with the token ID
    window.open(`https://etherscan.io/token/${post.tokenId}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-400 to-dark-300 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-primary-500/20 mb-4"></div>
          <div className="h-4 w-32 bg-primary-500/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-400 to-dark-300 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Post Not Found</h2>
          <p className="text-gray-400 mb-6">
            {error ||
              "The post you are looking for does not exist or has been removed."}
          </p>
          <button
            onClick={handleGoBack}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full text-white font-medium shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300"
          >
            Go Back
          </button>
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

          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Post Details</h1>
            <div className="flex space-x-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 text-gray-300 hover:text-white transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
              <button
                onClick={handleViewOnBlockchain}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 text-gray-300 hover:text-white transition-colors"
              >
                <ExternalLink size={16} />
                <span>View on Blockchain</span>
              </button>
            </div>
          </div>
        </div>

        {/* Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <BlogPost
            post={post}
            onLike={handleLikePost}
            onComment={() => {
              const commentsSection =
                document.getElementById("comments-section");
              if (commentsSection) {
                commentsSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
            onShare={() => handleCopyLink()}
          />
        </motion.div>

        {/* NFT Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-10 p-5 bg-black/30 backdrop-blur-lg rounded-xl border border-white/10"
        >
          <h2 className="text-xl font-bold text-white mb-4">NFT Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Token ID</p>
              <p className="text-white font-mono">{post.tokenId}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Owner</p>
              <p className="text-white font-mono truncate">
                {post.author.address}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">IPFS Hash</p>
              <p className="text-white font-mono truncate">{post.ipfsHash}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Created</p>
              <p className="text-white">
                {new Date(post.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          id="comments-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold text-white mb-6">
            Comments ({comments.length})
          </h2>
          <CommentSection
            comments={comments}
            postId={post.id}
            onAddComment={handleAddComment}
            onLikeComment={handleLikeComment}
            isLoading={commentLoading}
            error={commentError}
          />
        </motion.div>

        {/* Share Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="p-5 bg-black/30 backdrop-blur-lg rounded-xl border border-white/10 text-center"
        >
          <h3 className="text-lg font-bold text-white mb-2">Share this post</h3>
          <p className="text-gray-400 mb-4">
            Share this NFT post with your friends and followers
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full text-white font-medium shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300"
            >
              <Share2 size={18} />
              <span>Share Link</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PostDetailPage;
