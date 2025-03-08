import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp, Crown, Award } from "lucide-react";
import { useNFT } from "../../contexts/NFTContext";
import NFTGrid from "../nft/NFTGrid";
import Button from "../ui/Button";

const FeaturedSection: React.FC = () => {
  const { featuredNFTs, loadingNFTs } = useNFT();
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
    <section className="relative overflow-hidden py-4">
      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="relative max-w-4xl mx-auto dark:bg-gray-900/70 bg-white/70 shadow-lg ring-1 ring-black/10 rounded-xl p-4 sm:p-5 border border-white/20 dark:border-white/10 backdrop-blur-sm"
        >
          {/* Section Header - Ultra Compact */}
          <motion.div variants={itemVariants} className="text-center mb-4">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <h2
                className="text-2xl md:text-4xl font-display font-bold text-gray-900 dark:text-white relative inline-block"
                style={{ fontFamily: "'FirstFont', system-ui, sans-serif" }}
              >
                Featured <span className="gradient-text">NFTs</span>
              </h2>
              <span className="inline-flex items-center bg-purple-100/80 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-md border border-purple-200/50 dark:border-purple-700/50 shadow-sm transform translate-y-1">
                <Award className="inline-block w-3.5 h-3.5 mr-1.5" /> Featured
              </span>
            </div>
          </motion.div>

          {/* Featured Cards - Bigger Grid */}
          <motion.div variants={itemVariants} className="relative mb-4">
            <motion.div
              className="p-2 backdrop-blur-md bg-transparent rounded-xl border border-white/30 dark:border-white/10 shadow-lg shadow-purple-500/5"
              whileHover={{
                boxShadow: "0 15px 20px -3px rgba(147, 51, 234, 0.15)",
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="featured-nft-grid">
                <NFTGrid
                  nfts={featuredNFTs.slice(0, 3)}
                  columns={3}
                  variant="glass"
                  loading={loadingNFTs}
                  emptyMessage="No featured NFTs available"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Combined CTA and Stats for Space Efficiency */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-3">
            {/* CTA Button */}
            <motion.div
              variants={itemVariants}
              className="text-center md:text-left"
            >
              <Link to="/explore">
                <Button
                  variant="glass"
                  size="md"
                  className="from-purple-600 via-fuchsia-500 via-30% via-violet-500 via-60% to-indigo-500"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Explore All
                </Button>
              </Link>
            </motion.div>

            {/* Stats - Horizontal Layout */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-4 gap-2"
            >
              <div className="p-1.5 backdrop-blur-md bg-transparent rounded-md border border-white/20 dark:border-white/10 shadow-sm text-center">
                <div className="flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white font-display">
                  10K+
                </p>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                  Users
                </p>
              </div>
              <div className="p-1.5 backdrop-blur-md bg-transparent rounded-md border border-white/20 dark:border-white/10 shadow-sm text-center">
                <div className="flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white font-display">
                  8.5K+
                </p>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                  NFTs
                </p>
              </div>
              <div className="p-1.5 backdrop-blur-md bg-transparent rounded-md border border-white/20 dark:border-white/10 shadow-sm text-center">
                <div className="flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400">
                  <Crown className="h-4 w-4" />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white font-display">
                  3.2K+
                </p>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                  Artists
                </p>
              </div>
              <div className="p-1.5 backdrop-blur-md bg-transparent rounded-md border border-white/20 dark:border-white/10 shadow-sm text-center">
                <div className="flex items-center justify-center text-violet-600 dark:text-violet-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white font-display">
                  2.4M+
                </p>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                  Txns
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedSection;
