import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";

// Define your sections here
interface Section {
  id: number;
  component: React.ReactNode;
}

interface FullPageScrollProps {
  sections: Section[];
}

const FullPageScroll: React.FC<FullPageScrollProps> = ({ sections }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const controls = useAnimationControls();
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastScrollTime, setLastScrollTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch handling
  const touchStartY = useRef<number | null>(null);

  const changePage = useCallback(
    (nextPage: number) => {
      if (isAnimating || nextPage < 0 || nextPage >= sections.length) return;

      const now = Date.now();
      setLastScrollTime(now);
      setIsAnimating(true);
      setCurrentPage(nextPage);

      controls
        .start({
          y: `-${nextPage * 100}vh`,
          transition: {
            duration: 0.6,
            ease: [0.32, 0.72, 0, 1],
          },
        })
        .then(() => {
          setTimeout(() => {
            setIsAnimating(false);
          }, 200);
        });
    },
    [controls, isAnimating, sections.length]
  );

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (isAnimating) return;

      const threshold = 20;
      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTime;

      if (timeSinceLastScroll < 300) return;

      if (Math.abs(event.deltaY) > threshold) {
        if (event.deltaY > 0) {
          changePage(currentPage + 1);
        } else if (event.deltaY < 0) {
          changePage(currentPage - 1);
        }
      }
    },
    [changePage, currentPage, isAnimating, lastScrollTime]
  );

  const handleTouchStart = useCallback((event: TouchEvent) => {
    touchStartY.current = event.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (touchStartY.current === null || isAnimating) return;

      const touchEndY = event.changedTouches[0].clientY;
      const diff = touchStartY.current - touchEndY;
      const threshold = 50;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // Swiped up
          changePage(currentPage + 1);
        } else {
          // Swiped down
          changePage(currentPage - 1);
        }
      }

      touchStartY.current = null;
    },
    [changePage, currentPage, isAnimating]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isAnimating) return;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        changePage(currentPage + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        changePage(currentPage - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        changePage(0);
      } else if (e.key === "End") {
        e.preventDefault();
        changePage(sections.length - 1);
      }
    },
    [changePage, currentPage, isAnimating, sections.length]
  );

  // Add event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleWheel, handleTouchStart, handleTouchEnd, handleKeyDown]);

  // Navigation dots component
  const NavigationDots = () => (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
      <div className="flex flex-col items-center space-y-4">
        {sections.map((_, index) => (
          <div key={index} className="group relative flex items-center">
            <div className="mr-2 opacity-0 group-hover:opacity-100 text-right text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap transition-opacity duration-300 bg-white/20 dark:bg-black/20 backdrop-blur-sm py-1 px-2 rounded-full">
              {getSectionName(index)}
            </div>
            <motion.button
              className={`w-3 h-3 rounded-full transition-all duration-300 relative ${
                currentPage === index
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 scale-125"
                  : "bg-white/40 dark:bg-white/30 hover:bg-white/60 dark:hover:bg-white/50"
              }`}
              onClick={() => changePage(index)}
              aria-label={`Go to ${getSectionName(index)} section`}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
            >
              {currentPage === index && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/50 to-pink-500/50"
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.button>
          </div>
        ))}
      </div>
    </div>
  );

  // Helper function to get section names
  const getSectionName = (index: number) => {
    switch (index) {
      case 0:
        return "Hero";
      case 1:
        return "Featured NFTs";
      case 2:
        return "Trending";
      case 3:
        return "How It Works";
      case 4:
        return "Join Us";
      default:
        return `Section ${index + 1}`;
    }
  };

  return (
    <div
      ref={containerRef}
      className="overflow-hidden h-screen relative"
      style={{
        scrollbarWidth: "none" /* Firefox */,
        msOverflowStyle: "none" /* IE and Edge */,
      }}
    >
      <motion.div
        animate={controls}
        className="h-screen"
        initial={{ y: 0 }}
        style={{ willChange: "transform" }}
      >
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="h-screen w-full overflow-hidden"
            style={{
              position: "relative",
              padding: "0 20px", // Add default horizontal padding
              visibility:
                Math.abs(index - currentPage) <= 1 ? "visible" : "hidden", // Only render nearby sections for performance
            }}
          >
            {section.component}
          </div>
        ))}
      </motion.div>
      <NavigationDots />
    </div>
  );
};

export default FullPageScroll;
