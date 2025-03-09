import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Heart,
  MessageCircle,
  Calendar,
  User,
  Shield,
  Star,
  Bookmark,
  Link as LinkIcon,
  Zap,
  MoreHorizontal,
  Download,
} from "lucide-react";
import { useBlog } from "../../contexts/BlogContext";
import { useWeb3 } from "../../contexts/Web3Context";
import CommentSection from "../../components/blog/CommentSection";
import { toast } from "react-hot-toast";

const EnhancedPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchPost, fetchComments, likePost, addComment, likeComment, posts } =
    useBlog();
  const { account, blogPostContract } = useWeb3();

  const [post, setPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isMinting, setIsMinting] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [showMetadata, setShowMetadata] = useState(false);

  // Ref for comment section scrolling
  const commentSectionRef = useRef<HTMLDivElement>(null);

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
        setIsLiked(postData.hasLiked || false);
        setLikeCount(postData.likes || 0);

        // Load comments
        const commentsData = await fetchComments(id);
        setComments(commentsData);

        // Find related posts (posts by same author or with similar content)
        if (posts.length > 0 && postData) {
          const sameAuthorPosts = posts.filter(
            (p) =>
              p.id !== postData.id &&
              p.author.address.toLowerCase() ===
                postData.author.address.toLowerCase()
          );

          // Take up to 3 related posts
          setRelatedPosts(sameAuthorPosts.slice(0, 3));
        }
      } catch (err) {
        console.error("Error loading post:", err);
        setError("Failed to load post. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, fetchPost, fetchComments, posts]);

  useEffect(() => {
    // Scroll to comments if needed
    if (shouldFocusComment && !loading && post && commentSectionRef.current) {
      commentSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [shouldFocusComment, loading, post]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLikePost = async () => {
    if (!post) return;

    try {
      await likePost(post.id);
      // Update local state
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

      // Update post object
      setPost({
        ...post,
        hasLiked: !isLiked,
        likes: isLiked ? likeCount - 1 : likeCount + 1,
      });

      toast.success(isLiked ? "Post unliked" : "Post liked");
    } catch (err) {
      console.error("Error liking post:", err);
      toast.error("Failed to like post. Please try again.");
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
      const updatedComments = await fetchComments(postId);
      setComments(updatedComments);

      // Update post comment count
      setPost({
        ...post,
        comments: post.comments + 1,
      });

      toast.success("Comment added successfully!");
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
      setComments(
        comments.map((comment) => {
          if (comment.id === commentId) {
            const newHasLiked = !comment.hasLiked;
            return {
              ...comment,
              hasLiked: newHasLiked,
              likes: newHasLiked ? comment.likes + 1 : comment.likes - 1,
            };
          }
          return comment;
        })
      );
    } catch (err) {
      console.error("Error liking comment:", err);
      toast.error("Failed to like comment. Please try again.");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied to clipboard!");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link. Please try again.");
    }
  };

  const handleViewOnBlockchain = () => {
    if (!post) return;

    // Open blockchain explorer with the token ID
    window.open(`https://etherscan.io/token/${post.tokenId}`, "_blank");
  };

  const handleMintPost = async () => {
    if (!post || !account || !blogPostContract) {
      toast.error("Please connect your wallet to mint this post");
      return;
    }

    try {
      setIsMinting(true);
      // Placeholder for actual minting functionality
      // This would interact with the blockchain to mint the post as an NFT

      toast.success("Post minted successfully!");

      // Update post to show it's now owned by the user
      setPost({
        ...post,
        isOwned: true,
      });
    } catch (err) {
      console.error("Error minting post:", err);
      toast.error("Failed to mint post. Please try again.");
    } finally {
      setIsMinting(false);
    }
  };

  const handleShareToSocial = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this NFT blog post: ${post?.content.substring(0, 50)}...`;

    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-400 to-dark-300 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-dark-400"></div>
          </div>
          <p className="mt-4 text-gray-400">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-400 to-dark-300 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="mb-6 w-20 h-20 mx-auto bg-dark-500/50 rounded-full flex items-center justify-center">
            <ExternalLink size={36} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Post Not Found</h2>
          <p className="text-gray-400 mb-6">
            {error ||
              "The post you are looking for does not exist or has been removed."}
          </p>
          <button
            onClick={handleGoBack}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full text-white font-medium shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300"
          >
            Return to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-400 to-dark-300">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Navigation Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-between items-center mb-8"
        >
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Back to Feed</span>
          </button>

          <div className="flex space-x-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-500 hover:bg-dark-600 text-gray-300 hover:text-white transition-all"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-green-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <LinkIcon size={16} />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleShareToSocial("twitter")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 text-[#1DA1F2] transition-all"
            >
              <span>Twitter</span>
            </button>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Post Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2"
          >
            {/* Post Content Card */}
            <div className="glass-card group relative overflow-hidden border border-white/10 bg-black/30 backdrop-blur-lg rounded-xl p-6 mb-6">
              {/* NFT Badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-primary-500 to-secondary-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 flex items-center gap-1">
                <Star size={10} className="text-white" />
                <span>NFT</span>
              </div>

              {/* Author Section */}
              <div className="flex items-center mb-5">
                <div className="w-12 h-12 rounded-full border-2 border-primary-500 overflow-hidden">
                  <img
                    src={
                      post.author.avatar ||
                      `https://api.dicebear.com/6.x/identicon/svg?seed=${post.author.address}`
                    }
                    alt={post.author.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="ml-3">
                  <div className="flex items-center">
                    <h3 className="text-lg font-bold text-white">
                      {post.author.name}
                    </h3>
                    {post.author.verified && (
                      <Shield size={15} className="ml-1 text-primary-500" />
                    )}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <User size={12} className="mr-1" />
                    <span className="font-mono">{`${post.author.address.substring(0, 6)}...${post.author.address.substring(post.author.address.length - 4)}`}</span>
                  </div>
                </div>

                <div className="ml-auto flex items-center text-gray-400 text-sm">
                  <Calendar size={14} className="mr-1" />
                  <span>{formatDate(post.timestamp)}</span>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-6">
                <div className="text-white text-lg whitespace-pre-wrap break-words">
                  {post.content}
                </div>
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center space-x-5">
                  <button
                    onClick={handleLikePost}
                    className={`flex items-center gap-1.5 text-sm font-medium ${
                      isLiked
                        ? "text-red-500"
                        : "text-gray-400 hover:text-red-500"
                    } transition-colors`}
                  >
                    <Heart
                      size={18}
                      className={isLiked ? "fill-red-500" : ""}
                    />
                    <span>{likeCount}</span>
                  </button>

                  <button
                    onClick={() =>
                      commentSectionRef.current?.scrollIntoView({
                        behavior: "smooth",
                      })
                    }
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-primary-500 transition-colors"
                  >
                    <MessageCircle size={18} />
                    <span>{comments.length}</span>
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-primary-500 transition-colors"
                  >
                    <Share2 size={18} />
                    <span>Share</span>
                  </button>
                </div>

                {!post.isOwned && account && (
                  <button
                    onClick={handleMintPost}
                    disabled={isMinting}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary-600 to-secondary-700 text-white font-medium ${
                      isMinting
                        ? "opacity-70"
                        : "hover:shadow-lg hover:shadow-primary-600/20"
                    } transition-all`}
                  >
                    {isMinting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-1"></div>
                        <span>Minting...</span>
                      </>
                    ) : (
                      <>
                        <Bookmark size={16} />
                        <span>Mint Post</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div ref={commentSectionRef} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  Comments ({comments.length})
                </h2>
              </div>

              <CommentSection
                comments={comments}
                postId={post.id}
                onAddComment={handleAddComment}
                onLikeComment={handleLikeComment}
                isLoading={commentLoading}
                error={commentError}
              />
            </div>
          </motion.div>

          {/* Right Column - Metadata & Related Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-6"
          >
            {/* NFT Metadata */}
            <div className="glass-card border border-white/10 bg-black/30 backdrop-blur-lg rounded-xl overflow-hidden">
              <div
                className="p-4 bg-gradient-to-r from-primary-600/20 to-secondary-700/20 border-b border-white/5 flex justify-between items-center cursor-pointer"
                onClick={() => setShowMetadata(!showMetadata)}
              >
                <h3 className="text-lg font-bold text-white">NFT Metadata</h3>
                <button>
                  <MoreHorizontal size={20} className="text-gray-400" />
                </button>
              </div>

              <AnimatePresence>
                {showMetadata && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Token ID</p>
                        <div className="flex items-center">
                          <p className="text-white font-mono text-sm truncate mr-2">
                            {post.tokenId}
                          </p>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(post.tokenId)
                            }
                            className="text-gray-500 hover:text-white"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-400 text-sm mb-1">IPFS Hash</p>
                        <div className="flex items-center">
                          <p className="text-white font-mono text-sm truncate mr-2">
                            {post.ipfsHash}
                          </p>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(post.ipfsHash)
                            }
                            className="text-gray-500 hover:text-white"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-400 text-sm mb-1">Blockchain</p>
                        <p className="text-white text-sm">Ethereum</p>
                      </div>

                      <div className="pt-2 flex space-x-2">
                        <button
                          onClick={handleViewOnBlockchain}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-dark-500 hover:bg-dark-600 rounded-lg text-sm text-white transition-all"
                        >
                          <ExternalLink size={14} />
                          <span>View on Chain</span>
                        </button>

                        <button
                          onClick={() =>
                            window.open(
                              `https://ipfs.io/ipfs/${post.ipfsHash}`,
                              "_blank"
                            )
                          }
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-dark-500 hover:bg-dark-600 rounded-lg text-sm text-white transition-all"
                        >
                          <Download size={14} />
                          <span>IPFS</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Ownership Status */}
            <div
              className={`p-4 rounded-xl border ${post.isOwned ? "border-green-500/20 bg-green-500/10" : "border-yellow-500/20 bg-yellow-500/10"} backdrop-blur-sm`}
            >
              <div className="flex items-center">
                {post.isOwned ? (
                  <>
                    <Shield size={20} className="text-green-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-white">
                        You own this NFT
                      </h3>
                      <p className="text-sm text-gray-400">
                        This post is in your collection
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Zap size={20} className="text-yellow-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-white">
                        Available to Mint
                      </h3>
                      <p className="text-sm text-gray-400">
                        Add this post to your collection
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="glass-card border border-white/10 bg-black/30 backdrop-blur-lg rounded-xl overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-primary-600/20 to-secondary-700/20 border-b border-white/5">
                  <h3 className="text-lg font-bold text-white">
                    More from this Author
                  </h3>
                </div>

                <div className="divide-y divide-white/5">
                  {relatedPosts.map((relatedPost) => (
                    <div
                      key={relatedPost.id}
                      className="p-4 hover:bg-white/5 transition-colors"
                    >
                      <h4
                        className="text-white font-medium mb-2 line-clamp-2 cursor-pointer"
                        onClick={() => navigate(`/blog/post/${relatedPost.id}`)}
                      >
                        {relatedPost.content.substring(0, 100)}
                        {relatedPost.content.length > 100 ? "..." : ""}
                      </h4>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          {new Date(relatedPost.timestamp).toLocaleDateString()}
                        </span>
                        <div className="flex items-center text-gray-400 space-x-3">
                          <span className="flex items-center">
                            <Heart size={14} className="mr-1" />
                            {relatedPost.likes}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle size={14} className="mr-1" />
                            {relatedPost.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <div className="glass-card border border-white/10 bg-black/30 backdrop-blur-lg rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-3">
                Share this Post
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleShareToSocial("twitter")}
                  className="flex flex-col items-center justify-center py-3 rounded-lg bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 text-[#1DA1F2] transition-all"
                >
                  <span className="text-sm">Twitter</span>
                </button>

                <button
                  onClick={() => handleShareToSocial("facebook")}
                  className="flex flex-col items-center justify-center py-3 rounded-lg bg-[#4267B2]/20 hover:bg-[#4267B2]/30 text-[#4267B2] transition-all"
                >
                  <span className="text-sm">Facebook</span>
                </button>

                <button
                  onClick={() => handleShareToSocial("telegram")}
                  className="flex flex-col items-center justify-center py-3 rounded-lg bg-[#0088cc]/20 hover:bg-[#0088cc]/30 text-[#0088cc] transition-all"
                >
                  <span className="text-sm">Telegram</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPostPage;
