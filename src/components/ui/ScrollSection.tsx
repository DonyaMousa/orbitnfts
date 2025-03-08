import React, { ReactNode, useEffect, useRef } from "react";

interface ScrollSectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  bgColor?: string;
  onInView?: (id: string) => void;
}

const ScrollSection: React.FC<ScrollSectionProps> = ({
  children,
  id,
  className = "",
  bgColor = "bg-transparent",
  onInView,
}) => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!id || !onInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onInView(id);
        }
      },
      {
        root: null,
        rootMargin: "-40% 0px -40% 0px", // Trigger when the middle 20% of the section is visible
        threshold: 0.2, // Trigger when 20% of the section is visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [id, onInView]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`snap-start min-h-screen w-full flex flex-col justify-center items-center ${bgColor} ${className} scroll-mt-0`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
        {children}
      </div>
    </section>
  );
};

export default ScrollSection;
