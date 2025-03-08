import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Wallet, Upload, Tag, ShoppingCart, Sparkles, Zap } from "lucide-react";

const HowItWorksSection: React.FC = () => {
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
        staggerChildren: 0.2,
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

  const steps = [
    {
      icon: <Wallet className="h-8 w-8 text-purple-500" />,
      title: "Set up your wallet",
      description:
        "Connect your wallet to OrbitNFTs. We support MetaMask, WalletConnect, and more.",
    },
    {
      icon: <Upload className="h-8 w-8 text-indigo-500" />,
      title: "Create & Upload",
      description:
        "Upload your work and set up your collection. Add a title, description, and customize your NFTs.",
    },
    {
      icon: <Tag className="h-8 w-8 text-fuchsia-500" />,
      title: "List for sale",
      description:
        "Choose between auctions, fixed-price listings, or declining-price listings. You decide how you want to sell your NFTs.",
    },
    {
      icon: <ShoppingCart className="h-8 w-8 text-pink-500" />,
      title: "Buy & Collect",
      description:
        "Discover amazing artworks, buy NFTs, and build your collection with confidence.",
    },
  ];

  return (
    <section className="py-4">
      <div className="container mx-auto px-3 sm:px-4">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="p-4 backdrop-blur-md bg-transparent rounded-xl border border-white/30 dark:border-white/10 shadow-lg shadow-purple-500/5"
        >
          {/* Decorative Elements */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 -right-8 w-28 h-28 bg-gradient-to-tl from-indigo-500/20 to-purple-600/10 rounded-full blur-3xl"></div>

          {/* Section Title */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="relative inline-block">
              <h2
                className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white relative z-10"
                style={{ fontFamily: "'FirstFont', system-ui, sans-serif" }}
              >
                How It <span className="gradient-text">Works</span>
              </h2>
            </div>
            <p className="mt-4 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
              Get started with OrbitNFTs in just a few simple steps
            </p>
          </motion.div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="glass-card overflow-hidden p-6 bg-white/30 dark:bg-black/20 backdrop-blur-xl transition-all duration-300 border border-slate-200/50 dark:border-white/10 shadow-xl rounded-xl relative group"
                whileHover={{
                  y: -5,
                  boxShadow: "0 20px 25px -5px rgba(147, 51, 234, 0.15)",
                }}
              >
                {/* Step Number */}
                <div className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-sm">
                  {index + 1}
                </div>

                {/* Icon with glow effect */}
                <div className="mb-4 relative">
                  <div className="p-3 inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/20 backdrop-blur-sm">
                    {step.icon}
                  </div>
                  <div className="absolute inset-0 bg-purple-400/20 filter blur-xl rounded-full opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>

                {/* Hover effect element */}
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
