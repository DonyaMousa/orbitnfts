import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  Clock,
  BadgeCheck,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";

interface BlogPostProps {
  post: {
    id: string;
    tokenId: string;
    content: string;
    author: {
      id: string;
      name: string;
      address: string;
      avatar: string;
      verified: boolean;
    };
    timestamp: string;
    ipfsHash: string;
    likes: number;
    comments: number;
    hasLiked?: boolean;
    isOwned?: boolean;
  };
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
  index?: number;
  isNew?: boolean;
}

const BlogPost: React.FC<BlogPostProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  index = 0,
  isNew = false,
}) => {
  const [isLiked, setIsLiked] = useState(post.hasLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isHovered, setIsHovered] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleLike = () => {
    if (onLike) {
      onLike(post.id);
    }
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const formattedDate = new Date(post.timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Function to get time elapsed
  const getTimeElapsed = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diff = now.getTime() - postTime.getTime();

    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="w-full mb-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className={`glass-card group relative overflow-hidden border ${isNew ? "border-primary-500" : "border-white/10"} bg-black/30 backdrop-blur-lg rounded-xl p-5 transition-all duration-300`}
        animate={
          isNew
            ? {
                boxShadow: [
                  "0 0 0 rgba(80, 70, 230, 0)",
                  "0 0 20px rgba(80, 70, 230, 0.5)",
                  "0 0 0 rgba(80, 70, 230, 0)",
                ],
              }
            : {}
        }
        transition={
          isNew
            ? {
                duration: 2,
                repeat: 3,
                repeatType: "reverse",
              }
            : {}
        }
      >
        {/* Glow effect on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-600/10 opacity-0 transition-opacity duration-300 ${isHovered ? "opacity-100" : ""}`}
        />

        {/* NFT badge */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-primary-500 to-secondary-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 flex items-center gap-1">
          <Star size={10} className="text-white" />
          <span>NFT</span>
        </div>

        {/* Author section */}
        <div className="flex items-center mb-4 relative z-10">
          <Link to={`/profile/${post.author.id}`} className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full border-2 border-primary-500 overflow-hidden">
              <img
                src={
                  post.author.avatar ||
                  `https://api.dicebear.com/6.x/identicon/svg?seed=${post.author.address}`
                }
                alt={post.author.name}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          <div className="ml-3">
            <div className="flex items-center">
              <Link
                to={`/profile/${post.author.id}`}
                className="text-white font-bold hover:text-primary-400 transition duration-200"
              >
                {post.author.name}
              </Link>
              {post.author.verified && (
                <BadgeCheck size={16} className="ml-1 text-primary-400" />
              )}
            </div>
            <div className="flex items-center text-gray-400 text-xs">
              <Clock size={12} className="mr-1" />
              <span>{getTimeElapsed(post.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Post content */}
        <Link to={`/blog/post/${post.id}`}>
          <div className="relative z-10 mb-4">
            <p className="text-white/90 text-base">{post.content}</p>
          </div>
        </Link>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 relative z-10">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${isLiked ? "text-pink-400" : "text-gray-400 hover:text-pink-400"}`}
          >
            <Heart size={18} className={`${isLiked ? "fill-pink-400" : ""}`} />
            <span>{likeCount > 0 ? likeCount : ""}</span>
          </button>

          <button
            onClick={() => onComment && onComment(post.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-gray-400 hover:text-blue-400 transition-all duration-200"
          >
            <MessageCircle size={18} />
            <span>{post.comments > 0 ? post.comments : ""}</span>
          </button>

          <button
            onClick={() => onShare && onShare(post.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-gray-400 hover:text-green-400 transition-all duration-200"
          >
            <Share2 size={18} />
          </button>

          <div className="px-2 py-1 rounded-full text-xs bg-black/30 text-gray-400 flex items-center">
            <span className="text-primary-400">#</span>
            <span className="ml-1">{post.tokenId}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BlogPost;
