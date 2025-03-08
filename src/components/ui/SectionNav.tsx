import React, { useEffect } from "react";
import { motion } from "framer-motion";

interface SectionNavProps {
  sections: string[];
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

const SectionNav: React.FC<SectionNavProps> = ({
  sections,
  activeSection,
  onSectionClick,
}) => {
  // Format section name for display
  const formatSectionName = (section: string) => {
    return section
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 flex flex-col items-center gap-3">
      {sections.map((section) => (
        <div
          key={section}
          className="relative group flex items-center"
          onClick={() => onSectionClick(section)}
        >
          <div className="mr-2 opacity-0 group-hover:opacity-100 text-right transition-opacity duration-200 text-xs font-medium text-gray-700 dark:text-gray-300 select-none">
            {formatSectionName(section)}
          </div>

          <motion.div
            className={`w-3 h-3 rounded-full cursor-pointer transition-colors duration-200 ${
              activeSection === section
                ? "bg-purple-600 dark:bg-purple-500"
                : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Scroll to ${formatSectionName(section)} section`}
            role="button"
            tabIndex={0}
          />

          {activeSection === section && (
            <motion.div
              className="absolute inset-0 w-3 h-3 rounded-full bg-purple-400 dark:bg-purple-400 opacity-30"
              initial={{ scale: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default SectionNav;
