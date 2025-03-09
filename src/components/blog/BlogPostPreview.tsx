import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Clock, Star } from "lucide-react";

interface BlogPostPreviewProps {
  post: {
    id: string;
    tokenId: string;
    content: string;
    author: {
      name: string;
      address: string;
      avatar?: string;
    };
    timestamp: string;
    ipfsHash: string;
    likes: number;
    comments: number;
  };
  onMint?: () => void;
}

const BlogPostPreview: React.FC<BlogPostPreviewProps> = ({ post, onMint }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Format timestamp
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full mb-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="glass-card group relative overflow-hidden border border-white/10 bg-black/30 backdrop-blur-lg rounded-xl p-5 transition-all duration-300">
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
          <div className="flex-shrink-0">
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
          </div>
          <div className="ml-3">
            <div className="flex items-center">
              <span className="text-white font-bold">{post.author.name}</span>
            </div>
            <div className="flex items-center text-gray-400 text-xs">
              <Clock size={12} className="mr-1" />
              <span>{formatDate(post.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Post content */}
        <div className="relative z-10 mb-4">
          <p className="text-white/90 text-base">{post.content}</p>
        </div>

        {/* IPFS & Token info */}
        <div className="mt-4 p-3 bg-black/20 rounded-lg border border-white/5 relative z-10">
          <div className="flex flex-col gap-1 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>Token ID:</span>
              <span className="text-white font-mono">{post.tokenId}</span>
            </div>
            <div className="flex justify-between">
              <span>IPFS:</span>
              <span className="text-white font-mono truncate max-w-[200px]">
                {post.ipfsHash}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 relative z-10">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-gray-400 hover:text-pink-400 transition-all duration-200">
            <Heart size={18} />
            <span>{post.likes > 0 ? post.likes : ""}</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-gray-400 hover:text-blue-400 transition-all duration-200">
            <MessageCircle size={18} />
            <span>{post.comments > 0 ? post.comments : ""}</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-gray-400 hover:text-green-400 transition-all duration-200">
            <Share2 size={18} />
          </button>

          {onMint && (
            <button
              onClick={onMint}
              className="px-3 py-1.5 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full text-white text-sm font-medium shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300"
            >
              Mint as NFT
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BlogPostPreview;
