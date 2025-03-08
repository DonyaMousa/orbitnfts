import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Zap,
  Clock,
  Heart,
  Eye,
  Star,
  BadgeCheck,
} from "lucide-react";
import Button from "../ui/Button";
import { Heading } from "../ui/Heading";

const HeroSection: React.FC = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);

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

  // Cards data for more consistent management
  const cards = [
    {
      id: 0,
      title: "Cosmic Voyager #001",
      price: "0.85",
      rating: null,
      creator: "@cosmic_creator",
      likes: 142,
      views: "1.2K",
      image:
        "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?q=80&w=2832&auto=format&fit=crop",
      badge: "Ends in 12h 30m",
      isMain: true,
    },
    {
      id: 1,
      title: "Stellar Nebula",
      price: "0.35",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2864&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Lunar Eclipse",
      price: "0.42",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2874&auto=format&fit=crop",
    },
  ];

  // Handle card click to bring it to front
  const handleCardClick = (index: number) => {
    setActiveCardIndex(index);
  };

  // Get z-index based on active state
  const getCardStyle = (index: number) => {
    // The active card gets highest z-index
    if (index === activeCardIndex) return { zIndex: 30 };

    // Other cards get lower z-index based on their position in the array
    // This maintains a consistent stacking order for inactive cards
    return { zIndex: 20 - index };
  };

  return (
    <section className="relative max-w-4xl mx-auto dark:bg-gray-900 shadow-lg ring-1 ring-black/10 rounded-xl p-4 sm:p-5 border border-white/20 dark:border-white/10">
      {/* Purple gradient overlay for light mode */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-100/50 to-transparent dark:from-transparent dark:to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="flex flex-col lg:flex-row items-center justify-between"
        >
          {/* Hero Content */}
          <motion.div
            variants={containerVariants}
            className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 dark:text-white mb-6 hero-title"
              style={{ fontFamily: "'FirstFont', system-ui, sans-serif" }}
            >
              Discover, Collect & Sell{" "}
              <span className="gradient-text relative inline-block">
                Extraordinary
              </span>{" "}
              NFTs
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              OrbitNFTs is the world's first and largest NFT marketplace with a
              futuristic approach to digital collectibles.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/explore">
                <Button
                  variant="glass"
                  size="lg"
                  className="from-purple-600 via-fuchsia-500 via-30% via-violet-500 via-60% to-indigo-500"
                >
                  Explore
                </Button>
              </Link>
              <Link to="/create">
                <Button
                  variant="glass"
                  size="lg"
                  leftIcon={<Sparkles className="h-5 w-5" />}
                  className="from-blue-600 via-cyan-500 via-30% via-indigo-500 via-60% to-purple-500"
                >
                  Create NFT
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0"
            >
              <div className="text-center">
                <p className="text-3xl font-bold gradient-text">10K+</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Artworks
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold gradient-text">3.2K+</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Artists
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold gradient-text">8.9K+</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Collectors
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Featured NFT Cards */}
          <motion.div
            variants={itemVariants}
            className="lg:w-1/2 max-w-md mx-auto"
          >
            <div className="relative h-[500px] w-full">
              {/* Card Stack */}
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Main NFT Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  style={getCardStyle(0)}
                  onClick={() => handleCardClick(0)}
                  className="glass-card overflow-hidden absolute w-[90%] h-[380px] p-4 bg-white/30 dark:bg-black/20 backdrop-blur-xl cursor-pointer transition-all duration-300 border border-slate-200/50 dark:border-white/10 shadow-xl"
                  animate={{
                    translateY: activeCardIndex === 0 ? -10 : 0,
                    rotate: activeCardIndex === 0 ? 0 : 0,
                    scale: activeCardIndex === 0 ? 1 : 0.98,
                  }}
                >
                  <div className="relative h-full flex flex-col items-center justify-center rounded-lg m-auto shadow-lg bg-transparent p-3">
                    <div className="w-[70%] h-[60%] mx-auto overflow-hidden rounded-lg border border-slate-200/50 dark:border-white/15 shadow-md">
                      <img
                        src={cards[0].image}
                        alt={cards[0].title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Badge */}
                    <div className="absolute top-3 left-3 bg-slate-700/70 dark:bg-white/20 backdrop-blur-xl px-3 py-1 rounded-full flex items-center space-x-1 shadow-md border border-slate-600/30 dark:border-white/20">
                      <Clock className="h-3 w-3 text-white" />
                      <span className="text-xs font-medium text-white">
                        {cards[0].badge}
                      </span>
                    </div>

                    {/* Verified Badge */}
                    <div className="absolute top-3 right-3 bg-blue-500/70 backdrop-blur-xl p-1 rounded-full shadow-md border border-blue-400/30">
                      <BadgeCheck className="h-4 w-4 text-white" />
                    </div>

                    {/* Content Overlay */}
                    <div className="w-full mt-6 p-3 bg-slate-800/70 dark:bg-black/40 backdrop-blur-sm rounded-lg border border-slate-700/30 dark:border-white/10">
                      <div className="mb-2">
                        <div className="flex items-center mb-1">
                          <div className="h-4 w-4 rounded-full overflow-hidden mr-1 border border-slate-300/80 dark:border-white/50 shadow-sm">
                            <img
                              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop"
                              alt="Creator"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="text-white/90 text-[10px] font-medium">
                            {cards[0].creator}
                          </span>
                          <BadgeCheck className="h-3 w-3 text-blue-400 ml-0.5" />
                        </div>

                        <h3 className="text-white text-lg font-bold mt-1">
                          {cards[0].title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1 mb-2">
                          <div className="flex items-center text-white/80">
                            <Heart className="h-3 w-3 mr-0.5" />
                            <span className="text-[10px]">
                              {cards[0].likes}
                            </span>
                          </div>
                          <div className="flex items-center text-white/80">
                            <Eye className="h-3 w-3 mr-0.5" />
                            <span className="text-[10px]">
                              {cards[0].views}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white/60 text-xs">Current Bid</p>
                          <p className="text-white font-semibold">
                            {cards[0].price} ETH{" "}
                            <span className="text-white/60 text-xs">
                              ($2,453)
                            </span>
                          </p>
                        </div>
                        <Button
                          variant="glass"
                          size="sm"
                          leftIcon={<Zap className="h-4 w-4" />}
                          className="from-pink-600 via-purple-500 via-30% via-fuchsia-500 via-60% to-rose-500"
                        >
                          Bid Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Card 2 - Positioned behind main card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  style={getCardStyle(1)}
                  onClick={() => handleCardClick(1)}
                  className="glass-card overflow-hidden absolute w-[90%] h-[380px] p-3 bg-white/30 dark:bg-black/20 backdrop-blur-xl cursor-pointer transition-all duration-300 border border-slate-200/50 dark:border-white/10 shadow-xl"
                  animate={{
                    translateY: activeCardIndex === 1 ? -10 : 15,
                    translateX: activeCardIndex === 1 ? 0 : -15,
                    rotate: activeCardIndex === 1 ? 0 : -5,
                    scale: activeCardIndex === 1 ? 1 : 0.92,
                  }}
                >
                  <div className="relative h-full bg-transparent rounded-lg flex flex-col items-center justify-center p-4">
                    <div className="w-[65%] h-[55%] mx-auto overflow-hidden rounded-lg border border-slate-200/50 dark:border-white/15 shadow-md">
                      <img
                        src={cards[1].image}
                        alt={cards[1].title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-full mt-5 p-3 bg-slate-800/70 dark:bg-black/40 backdrop-blur-sm rounded-lg border border-slate-700/30 dark:border-white/10">
                      <div className="flex items-center mb-1">
                        <div className="h-3 w-3 rounded-full overflow-hidden mr-1 border border-slate-300/80 dark:border-white/50 shadow-sm">
                          <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop"
                            alt="Creator"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="text-white/90 text-[10px] font-medium">
                          Creator
                        </span>
                      </div>
                      <h4 className="text-white text-sm font-semibold">
                        {cards[1].title}
                      </h4>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-white/90 text-xs font-medium">
                          {cards[1].price} ETH
                        </p>
                        <div className="flex items-center bg-slate-700/70 dark:bg-white/15 backdrop-blur-md px-2 py-0.5 rounded-full border border-slate-600/30 dark:border-white/10">
                          <Star className="h-3 w-3 text-yellow-400 mr-1" />
                          <span className="text-white/90 text-xs">
                            {cards[1].rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Card 3 - Also positioned behind main card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  style={getCardStyle(2)}
                  onClick={() => handleCardClick(2)}
                  className="glass-card overflow-hidden absolute w-[90%] h-[380px] p-3 bg-white/30 dark:bg-black/20 backdrop-blur-xl cursor-pointer transition-all duration-300 border border-slate-200/50 dark:border-white/10 shadow-xl"
                  animate={{
                    translateY: activeCardIndex === 2 ? -10 : 30,
                    translateX: activeCardIndex === 2 ? 0 : 10,
                    rotate: activeCardIndex === 2 ? 0 : 5,
                    scale: activeCardIndex === 2 ? 1 : 0.85,
                  }}
                >
                  <div className="relative h-full bg-transparent rounded-lg flex flex-col items-center justify-center p-4">
                    <div className="w-[60%] h-[50%] mx-auto overflow-hidden rounded-lg border border-slate-200/50 dark:border-white/15 shadow-md">
                      <img
                        src={cards[2].image}
                        alt={cards[2].title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-full mt-5 p-3 bg-slate-800/70 dark:bg-black/40 backdrop-blur-sm rounded-lg border border-slate-700/30 dark:border-white/10">
                      <div className="flex items-center mb-1">
                        <div className="h-3 w-3 rounded-full overflow-hidden mr-1 border border-slate-300/80 dark:border-white/50 shadow-sm">
                          <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop"
                            alt="Creator"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="text-white/90 text-[10px] font-medium">
                          Creator
                        </span>
                      </div>
                      <h4 className="text-white text-sm font-semibold">
                        {cards[2].title}
                      </h4>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-white/90 text-xs font-medium">
                          {cards[2].price} ETH
                        </p>
                        <div className="flex items-center bg-slate-700/70 dark:bg-white/15 backdrop-blur-md px-2 py-0.5 rounded-full border border-slate-600/30 dark:border-white/10">
                          <Star className="h-3 w-3 text-yellow-400 mr-1" />
                          <span className="text-white/90 text-xs">
                            {cards[2].rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
