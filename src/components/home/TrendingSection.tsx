import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Flame, Award } from "lucide-react";
import { useNFT } from "../../contexts/NFTContext";
import CollectionCard from "../nft/CollectionCard";
import { Collection } from "../../contexts/NFTContext";

// CSS for glass card effect - Updated to match the style used in other components
const glassCardStyle = {
  background: "rgba(255, 255, 255, 0.3)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.5)",
  borderRadius: "12px",
  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
  overflow: "hidden",
  transition: "all 0.3s ease",
};

const TrendingSection: React.FC = () => {
  const { trendingCollections } = useNFT();
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <section className="py-4">
      <div className="container mx-auto px-3 sm:px-4">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="p-2 backdrop-blur-md bg-transparent rounded-xl border border-white/30 dark:border-white/10 shadow-lg shadow-purple-500/5"
        >
          {/* Header with Animation */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-between mb-4 p-2"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-4 sm:mb-0">
              <div className="relative">
                <h2
                  className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white relative z-10"
                  style={{ fontFamily: "'FirstFont', system-ui, sans-serif" }}
                >
                  Trending <span className="gradient-text">Collections</span>
                </h2>
              </div>

              <div className="inline-flex items-center bg-purple-100/80 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-md border border-purple-200/50 dark:border-purple-700/50 shadow-sm transform translate-y-1">
                <Flame className="w-3.5 h-3.5 mr-1.5" /> Hot Now
              </div>
            </div>

            <Link
              to="/collections"
              className="hidden md:flex items-center text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors group"
            >
              <span>View All</span>
              <motion.div
                className="ml-1 bg-purple-200 dark:bg-purple-800/50 rounded-full p-1"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.div>
            </Link>
          </motion.div>

          {/* Brief Description with Animation */}
          <motion.p
            variants={itemVariants}
            className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6 text-center"
          >
            Explore the most sought-after NFT collections making waves in the
            digital art world
          </motion.p>

          {/* Collection Cards with Enhanced Effects */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {trendingCollections.slice(0, 3).map((collection, index) => (
              <motion.div
                key={collection.id}
                className="glass-card overflow-hidden w-full p-3 bg-white/30 dark:bg-black/20 backdrop-blur-xl cursor-pointer transition-all duration-300 border border-slate-200/50 dark:border-white/10 shadow-xl"
                whileHover={{
                  y: -5,
                  boxShadow: "0 20px 25px -5px rgba(147, 51, 234, 0.15)",
                  borderColor: "rgba(255, 255, 255, 0.4)",
                }}
                transition={{ duration: 0.3 }}
              >
                <CollectionCard collection={collection} index={index} />
              </motion.div>
            ))}
          </motion.div>

          {/* Mobile View All Link */}
          <motion.div
            variants={itemVariants}
            className="mt-6 text-center md:hidden"
          >
            <Link
              to="/collections"
              className="inline-flex items-center py-2 px-4 bg-purple-100/50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 transition-colors hover:bg-purple-200/50 dark:hover:bg-purple-800/30"
            >
              View All Collections
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>

          {/* Decorative Elements */}
          <div className="hidden md:block absolute -bottom-4 -right-4 w-28 h-28 bg-gradient-to-tl from-purple-400/10 to-transparent rounded-full blur-xl pointer-events-none"></div>
          <div className="hidden md:block absolute -top-4 -left-4 w-28 h-28 bg-gradient-to-br from-indigo-400/10 to-transparent rounded-full blur-xl pointer-events-none"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrendingSection;
