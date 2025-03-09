import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, Heart, MoreHorizontal, Clock } from "lucide-react";

interface Author {
  id: string;
  name: string;
  address: string;
  avatar: string;
  verified: boolean;
}

interface Comment {
  id: string;
  content: string;
  author: Author;
  timestamp: string;
  likes: number;
  hasLiked?: boolean;
}

interface CommentSectionProps {
  comments: Comment[];
  postId: string;
  onAddComment: (postId: string, comment: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  postId,
  onAddComment,
  onLikeComment,
  isLoading = false,
  error,
}) => {
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && !submitting) {
      try {
        setSubmitting(true);
        await onAddComment(postId, newComment);
        setNewComment("");
      } catch (error) {
        console.error("Error adding comment:", error);
      } finally {
        setSubmitting(false);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    }
  };

  // Function to get time elapsed
  const getTimeElapsed = (timestamp: string) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diff = now.getTime() - commentTime.getTime();

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
    <div className="w-full">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mr-2">
            <img
              src="https://api.dicebear.com/6.x/identicon/svg?seed=user" // Replace with actual user avatar
              alt="Your avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-grow relative">
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              disabled={submitting}
              className="w-full rounded-full bg-black/30 backdrop-blur-md border border-white/10 py-2 pl-4 pr-10 text-white placeholder-gray-500 outline-none focus:border-primary-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-400 hover:text-primary-300 disabled:text-gray-600 disabled:cursor-not-allowed p-1"
            >
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
        {error && <p className="text-red-400 text-sm mt-1 ml-10">{error}</p>}
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {comments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4"
            >
              <p className="text-gray-400 text-sm">
                No comments yet. Be the first to comment!
              </p>
            </motion.div>
          ) : (
            comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex"
              >
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={
                        comment.author.avatar ||
                        `https://api.dicebear.com/6.x/identicon/svg?seed=${comment.author.address}`
                      }
                      alt={comment.author.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-lg p-3 relative group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-white font-medium text-sm">
                          {comment.author.name}
                        </p>
                        <div className="flex items-center text-gray-500 text-xs">
                          <Clock size={10} className="mr-0.5" />
                          <span>{getTimeElapsed(comment.timestamp)}</span>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                    <p className="text-white/90 text-sm mb-2">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onLikeComment(comment.id)}
                        className={`flex items-center gap-1 text-xs ${comment.hasLiked ? "text-pink-400" : "text-gray-400 hover:text-pink-400"}`}
                      >
                        <Heart
                          size={14}
                          className={`${comment.hasLiked ? "fill-pink-400" : ""}`}
                        />
                        <span>
                          {comment.likes > 0 ? comment.likes : "Like"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 size={24} className="animate-spin text-primary-500" />
        </div>
      )}
    </div>
  );
};

export default CommentSection;
