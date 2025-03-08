import React from "react";
import HeroSection from "../components/home/HeroSection";
import FeaturedSection from "../components/home/FeaturedSection";
import TrendingSection from "../components/home/TrendingSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import CTASection from "../components/home/CTASection";
import FullPageScroll from "../components/ui/FullPageScroll";

const HomePage: React.FC = () => {
  // Define sections for the fullpage scroll
  const sections = [
    {
      id: 1,
      component: (
        <div className="w-full h-full bg-transparent flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <HeroSection />
          </div>
        </div>
      ),
    },
    {
      id: 2,
      component: (
        <div className="w-full h-full bg-transparent flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <FeaturedSection />
          </div>
        </div>
      ),
    },
    {
      id: 3,
      component: (
        <div className="w-full h-full bg-transparent flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <TrendingSection />
          </div>
        </div>
      ),
    },
    {
      id: 4,
      component: (
        <div className="w-full h-full bg-transparent flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <HowItWorksSection />
          </div>
        </div>
      ),
    },
    {
      id: 5,
      component: (
        <div className="w-full h-full bg-transparent flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <CTASection />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="h-screen overflow-hidden relative bg-gradient-to-b from-purple-50/90 to-white/90 dark:from-gray-900/90 dark:to-gray-800/90">
      {/* Global purple neon effects for the entire homepage */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.2),transparent_70%)] pointer-events-none z-0"></div>

      {/* Main top glow */}
      <div className="fixed top-[-10%] left-[5%] w-[90%] h-[50%]  via-fuchsia-200/10 to-transparent rounded-full blur-3xl dark:from-purple-700/20 dark:via-fuchsia-600/15 pointer-events-none z-0"></div>

      {/* Right side accent */}
      <div className="fixed top-[30%] right-[-10%] w-[40%] h-[40%] bg-gradient-to-l from-indigo-300/20 via-purple-200/10 to-transparent rounded-full blur-3xl dark:from-indigo-700/20 dark:via-purple-600/10 pointer-events-none z-0"></div>

      {/* Bottom glow */}
      <div className="fixed bottom-[-5%] left-[10%] w-[80%] h-[30%] bg-gradient-to-t from-purple-300/15 via-violet-200/10 to-transparent rounded-full blur-3xl dark:from-purple-800/15 dark:via-violet-700/10 pointer-events-none z-0"></div>

      <FullPageScroll sections={sections} />
    </div>
  );
};

export default HomePage;
