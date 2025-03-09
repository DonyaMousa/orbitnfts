import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BlogPost from "./BlogPost";
import { Loader2 } from "lucide-react";

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

interface BlogFeedProps {
  posts: Post[];
  loading?: boolean;
  error?: string;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
  loadMore?: () => void;
  hasMore?: boolean;
  newPostId?: string;
}

const BlogFeed: React.FC<BlogFeedProps> = ({
  posts,
  loading = false,
  error,
  onLike,
  onComment,
  onShare,
  loadMore,
  hasMore = false,
  newPostId = "",
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [recentlyCreated, setRecentlyCreated] = useState<string>(newPostId);

  // Reset the "new" status after a while
  useEffect(() => {
    if (newPostId) {
      setRecentlyCreated(newPostId);

      // After 10 seconds, clear the "new" status
      const timer = setTimeout(() => {
        setRecentlyCreated("");
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [newPostId]);

  // Handle scroll event for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);

      // If we're near the bottom and we have more posts to load
      if (
        hasMore &&
        loadMore &&
        !loading &&
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500
      ) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, loadMore]);

  if (error) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-center p-6 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-white/80 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {posts.length === 0 && !loading ? (
        <div className="text-center py-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-white mb-2">No Posts Yet</h3>
            <p className="text-gray-400 mb-6">Be the first to create a post!</p>
          </motion.div>
        </div>
      ) : (
        <div className="space-y-6 pb-10">
          {posts.map((post, index) => (
            <BlogPost
              key={post.id}
              post={post}
              onLike={onLike}
              onComment={onComment}
              onShare={onShare}
              index={index}
              isNew={post.id === recentlyCreated}
            />
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="flex flex-col items-center">
            <Loader2 size={30} className="animate-spin text-primary-500 mb-2" />
            <p className="text-gray-400 text-sm">Loading more posts...</p>
          </div>
        </div>
      )}

      {/* Load more button (alternative to infinite scroll) */}
      {hasMore && !loading && posts.length > 0 && (
        <div className="flex justify-center py-8">
          <button
            onClick={loadMore}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full text-white font-medium shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogFeed;
