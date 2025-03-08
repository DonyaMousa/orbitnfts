import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import { Rocket } from "lucide-react";
import Button from "../ui/Button";

const CTASection: React.FC = () => {
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
          className="relative overflow-hidden rounded-xl p-4 backdrop-blur-md bg-transparent border border-white/30 dark:border-white/10 shadow-lg shadow-purple-500/5"
        >
          {/* Background with gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 opacity-80"></div>

          {/* Animated orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-pulse-slow"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-pulse-slow"
            style={{ animationDelay: "1s" }}
          ></div>

          <div className="relative py-12 px-6 md:py-16 md:px-12 text-center">
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl font-display font-bold text-white mb-6"
              style={{ fontFamily: "'FirstFont', system-ui, sans-serif" }}
            >
              Ready to Start Your{" "}
              <span className="gradient-text">NFT Journey?</span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-lg text-white/80 max-w-2xl mx-auto mb-8"
            >
              Join thousands of artists and collectors in the world's most
              vibrant digital marketplace.
            </motion.p>

            <motion.div variants={itemVariants}>
              <Link to="/explore">
                <Button
                  variant="glass"
                  size="lg"
                  leftIcon={<Rocket className="h-5 w-5" />}
                  className="from-purple-600 via-fuchsia-500 via-30% via-violet-500 via-60% to-indigo-500"
                >
                  Explore the Marketplace
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
