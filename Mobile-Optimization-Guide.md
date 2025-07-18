# Mobile Optimization Guide

## Overview
This guide covers the mobile-first approach implemented in the Dashboard component and provides best practices for maintaining optimal mobile performance.

## CSS Architecture

### Mobile-First Utility Classes
\`\`\`css
/* Core mobile utilities used in Dashboard */
.mobile-scroll-container {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: auto;
  scroll-behavior: smooth;
  touch-action: pan-y;
}

.mobile-container {
  padding: 1rem;
  max-width: 100%;
  margin: 0 auto;
}

.mobile-space-md {
  margin-bottom: 1.5rem;
}

.mobile-p-md {
  padding: 1rem;
}

.mobile-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.mobile-card {
  padding: 1rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.mobile-touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-optimized {
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}
\`\`\`

### Responsive Typography
\`\`\`css
/* Text sizing for mobile readability */
.text-mobile-xs { font-size: 0.75rem; line-height: 1rem; }
.text-mobile-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-mobile-base { font-size: 1rem; line-height: 1.5rem; }
.text-mobile-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-mobile-xl { font-size: 1.25rem; line-height: 1.75rem; }
\`\`\`

## Touch Interaction Guidelines

### Gesture Implementation
\`\`\`javascript
// Swipe gesture configuration
const SWIPE_CONFIG = {
  threshold: 50,        // Minimum distance for swipe
  restraint: 100,       // Maximum perpendicular distance
  allowedTime: 300,     // Maximum time for swipe
  hapticFeedback: true  // Enable vibration feedback
};

const useSwipeGestures = (ref, onSwipe) => {
  useEffect(() => {
    let startX, startY, startTime;
    
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
    };
    
    const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      const distX = touch.clientX - startX;
      const distY = touch.clientY - startY;
      const elapsedTime = Date.now() - startTime;
      
      if (elapsedTime <= SWIPE_CONFIG.allowedTime) {
        if (Math.abs(distX) >= SWIPE_CONFIG.threshold && Math.abs(distY) <= SWIPE_CONFIG.restraint) {
          const direction = distX < 0 ? 'left' : 'right';
          onSwipe(direction);
          
          if (SWIPE_CONFIG.hapticFeedback && 'vibrate' in navigator) {
            navigator.vibrate(50);
          }
        } else if (Math.abs(distY) >= SWIPE_CONFIG.threshold && Math.abs(distX) <= SWIPE_CONFIG.restraint) {
          const direction = distY < 0 ? 'up' : 'down';
          onSwipe(direction);
          
          if (SWIPE_CONFIG.hapticFeedback && 'vibrate' in navigator) {
            navigator.vibrate(50);
          }
        }
      }
    };
    
    const element = ref.current;
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    
    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [ref, onSwipe]);
};
\`\`\`

### Touch Target Optimization
\`\`\`javascript
// Ensure all interactive elements meet minimum touch target size
const TouchButton = ({ children, onClick, className = '', ...props }) => {
  return (
    <button
      className={`mobile-touch-target ${className}`}
      onClick={onClick}
      style={{
        minHeight: '44px',
        minWidth: '44px',
        padding: '12px 16px'
      }}
      {...props}
    >
      {children}
    </button>
  );
};
\`\`\`

## Performance Optimization

### Lazy Loading Implementation
\`\`\`javascript
// Lazy load components below the fold
const LazyDetailedStats = lazy(() => import('./DetailedStats'));
const LazyQuickActions = lazy(() => import('./QuickActions'));

// Use Intersection Observer for progressive loading
const useProgressiveLoading = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return [ref, isVisible];
};
\`\`\`

### Image Optimization
\`\`\`javascript
// Progressive image loading
const OptimizedImage = ({ src, alt, className, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    img.src = src;
  }, [src]);
  
  return (
    <div className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      {imageSrc && (
        <img
          src={imageSrc || "/placeholder.svg"}
          alt={alt}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          {...props}
        />
      )}
    </div>
  );
};
\`\`\`

## Accessibility on Mobile

### Screen Reader Support
\`\`\`javascript
// Enhanced accessibility for mobile screen readers
const AccessibleStatsCard = ({ title, value, description, icon: Icon }) => {
  return (
    <div
      className="mobile-card"
      role="region"
      aria-labelledby={`stats-${title.toLowerCase()}`}
      tabIndex={0}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 id={`stats-${title.toLowerCase()}`} className="sr-only">
            {title} Statistics
          </h3>
          <div
            className="text-3xl font-bold"
            aria-label={`${title}: ${value}`}
          >
            {value}
          </div>
          <div className="text-sm text-gray-600" aria-describedby={`desc-${title.toLowerCase()}`}>
            {title}
          </div>
          <div id={`desc-${title.toLowerCase()}`} className="sr-only">
            {description}
          </div>
        </div>
        <Icon className="text-2xl" aria-hidden="true" />
      </div>
    </div>
  );
};
\`\`\`

### Keyboard Navigation
\`\`\`javascript
// Enhanced keyboard navigation for mobile users with external keyboards
const useKeyboardNavigation = () => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowRight':
          if (e.ctrlKey) {
            navigate('/activities');
            e.preventDefault();
          }
          break;
        case 'ArrowUp':
          if (e.ctrlKey) {
            setShowMoreStats(true);
            e.preventDefault();
          }
          break;
        case 'ArrowDown':
          if (e.ctrlKey) {
            setShowMoreStats(false);
            e.preventDefault();
          }
          break;
        case 'Escape':
          setShowChildRegistration(false);
          e.preventDefault();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
};
\`\`\`

## Testing Mobile Features

### Touch Event Testing
\`\`\`javascript
// Test touch interactions
const simulateSwipe = (element, direction) => {
  const startEvent = new TouchEvent('touchstart', {
    touches: [{ clientX: 100, clientY: 100 }]
  });
  
  const endEvent = new TouchEvent('touchend', {
    changedTouches: [{
      clientX: direction === 'left' ? 50 : 150,
      clientY: 100
    }]
  });
  
  element.dispatchEvent(startEvent);
  setTimeout(() => element.dispatchEvent(endEvent), 100);
};

// Test example
test('handles left swipe navigation', () => {
  const mockNavigate = jest.fn();
  render(<Dashboard />);
  
  const dashboard = screen.getByTestId('dashboard-container');
  simulateSwipe(dashboard, 'left');
  
  expect(mockNavigate).toHaveBeenCalledWith('/activities');
});
\`\`\`

### Viewport Testing
\`\`\`javascript
// Test different viewport sizes
const viewportSizes = [
  { width: 320, height: 568, name: 'iPhone SE' },
  { width: 375, height: 667, name: 'iPhone 8' },
  { width: 414, height: 896, name: 'iPhone 11' },
  { width: 768, height: 1024, name: 'iPad' }
];

viewportSizes.forEach(({ width, height, name }) => {
  test(`renders correctly on ${name}`, () => {
    Object.defineProperty(window, 'innerWidth', { value: width });
    Object.defineProperty(window, 'innerHeight', { value: height });
    
    render(<Dashboard />);
    
    // Test responsive behavior
    expect(screen.getByTestId('mobile-container')).toBeInTheDocument();
  });
});
\`\`\`

## Performance Monitoring

### Mobile Performance Metrics
\`\`\`javascript
// Monitor mobile-specific performance
const useMobilePerformance = () => {
  useEffect(() => {
    // Monitor touch response time
    let touchStartTime;
    
    const handleTouchStart = () => {
      touchStartTime = performance.now();
    };
    
    const handleTouchEnd = () => {
      const touchDuration = performance.now() - touchStartTime;
      
      // Log slow touch responses (> 100ms)
      if (touchDuration > 100) {
        console.warn(`Slow touch response: ${touchDuration}ms`);
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
  
  // Monitor scroll performance
  useEffect(() => {
    let scrollStartTime;
    let isScrolling = false;
    
    const handleScrollStart = () => {
      if (!isScrolling) {
        scrollStartTime = performance.now();
        isScrolling = true;
      }
    };
    
    const handleScrollEnd = () => {
      if (isScrolling) {
        const scrollDuration = performance.now() - scrollStartTime;
        isScrolling = false;
        
        // Log janky scrolling (> 16ms per frame)
        if (scrollDuration > 100) {
          console.warn(`Janky scroll detected: ${scrollDuration}ms`);
        }
      }
    };
    
    let scrollTimeout;
    const handleScroll = () => {
      handleScrollStart();
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScrollEnd, 150);
    };
    
    document.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      document.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);
};
\`\`\`

---

*This guide should be used in conjunction with the main Dashboard documentation for complete implementation guidance.*
