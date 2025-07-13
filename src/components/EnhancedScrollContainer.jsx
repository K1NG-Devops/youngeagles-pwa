import React, { useRef, useEffect } from 'react';

/**
 * EnhancedScrollContainer - Ultra-smooth scrolling container with perfect mobile experience
 * Provides momentum scrolling, bounce prevention, and smooth gesture handling
 */
const EnhancedScrollContainer = ({ 
  children, 
  className = '', 
  enablePullToRefresh = false,
  onRefresh: _onRefresh = null,
  scrollToTopButton = true,
  ...props 
}) => {
  const containerRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  // Handle scroll events for scroll-to-top button
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !scrollToTopButton) return;

    const handleScroll = () => {
      setShowScrollTop(container.scrollTop > 200);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollToTopButton]);

  // Smooth scroll to top
  const scrollToTop = () => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative">
      {/* Enhanced scroll container */}
      <div
        ref={containerRef}
        className={`
          ultra-smooth-scroll
          h-full w-full
          overscroll-behavior-y-contain
          scroll-smooth
          ${className}
        `}
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          scrollBehavior: 'smooth'
        }}
        {...props}
      >
        {/* Content */}
        <div className="relative">
          {children}
        </div>
      </div>

      {/* Scroll to top button */}
      {scrollToTopButton && showScrollTop && (
        <button
          onClick={scrollToTop}
          className="
            fixed bottom-24 right-4 z-40
            w-12 h-12 
            bg-blue-500 hover:bg-blue-600 
            text-white 
            rounded-full 
            shadow-lg 
            flex items-center justify-center
            transition-all duration-300
            touch-responsive
            hover:scale-110
          "
          aria-label="Scroll to top"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default EnhancedScrollContainer;