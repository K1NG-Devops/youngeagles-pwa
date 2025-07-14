import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';
import SideNavigation from './SideNavigation';
import TopNavigation from './TopNavigation';
import FloatingNavigation from './FloatingNavigation';
import Footer from './Footer';
import SubscriptionBanner from './subscription/SubscriptionBanner';
// import BottomBannerAd from './ads/BottomBannerAd'; // Removed - ads disabled
import ServiceWorkerUpdate from './ServiceWorkerUpdate';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSubscription } from '../contexts/SubscriptionContext';

const Layout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const { navigationStyle, NAVIGATION_STYLES } = useNavigation();
  const { showAds } = useSubscription();
  
  // Show components based on authentication and route
  const showGlobalHeader = isAuthenticated && location.pathname !== '/login' && location.pathname !== '/register';
  const showSubscriptionBanner = isAuthenticated;
  const showFooter = !isAuthenticated;

  // Modal cleanup effect - ensure no stuck modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        // Close any stuck modals by removing their backdrop classes
        const modals = document.querySelectorAll('.fixed.inset-0');
        modals.forEach(modal => {
          if (modal.classList.contains('z-50') || modal.classList.contains('z-[9999]')) {
            // Check if it's a modal that should be closeable
            if (modal.querySelector('[data-modal-backdrop]') || modal.style.backgroundColor?.includes('black')) {
              modal.style.display = 'none';
            }
          }
        });
        
        // Ensure body scroll is restored
        document.body.style.overflow = 'unset';
      }
    };

    // Route change cleanup - close any stuck modals
    const handleRouteChange = () => {
      // Close any stuck modals
      const modals = document.querySelectorAll('.fixed.inset-0');
      modals.forEach(modal => {
        if (modal.classList.contains('z-50') || modal.classList.contains('z-[9999]')) {
          modal.style.display = 'none';
        }
      });
      
      // Ensure body scroll is restored
      document.body.style.overflow = 'unset';
    };

    document.addEventListener('keydown', handleEscape);
    
    // Cleanup on route change
    handleRouteChange();
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [location.pathname]);

  const renderNavigation = () => {
    if (!isAuthenticated) return null;

    switch (navigationStyle) {
    case NAVIGATION_STYLES.TOP:
      return <TopNavigation />;
    case NAVIGATION_STYLES.SIDE:
      return <SideNavigation />;
    case NAVIGATION_STYLES.FLOATING:
      return <FloatingNavigation />;
    case NAVIGATION_STYLES.BOTTOM:
    default:
      return <Navigation />;
    }
  };

  // Calculate proper padding for clean layout - ENHANCED FOR BETTER UX AND AD INTEGRATION
  const getContentClasses = () => {
    let classes = 'flex-grow relative min-h-0'; // Added min-h-0 for flex issues
    
    // Add padding based on what's showing - optimized spacing
    if (showGlobalHeader) classes += ' pt-16';
    if (showSubscriptionBanner) classes += ' pt-8'; // Reduced from pt-10
    
    // Add padding based on navigation style - FIXED OVERLAP ISSUES
    switch (navigationStyle) {
    case NAVIGATION_STYLES.TOP:
      classes += ' pt-14'; // Slightly reduced for better mobile experience
      break;
    case NAVIGATION_STYLES.BOTTOM: {
      // ENHANCED: Better bottom spacing that accounts for ads and device variations
      const isMobile = window.innerWidth < 768;
      const hasAds = showAds() && isAuthenticated;
      const hasSafeArea = typeof window !== 'undefined' && window.CSS && window.CSS.supports('padding-bottom', 'env(safe-area-inset-bottom)');
      
      if (hasAds && isMobile) {
        classes += hasSafeArea ? ' pb-28' : ' pb-24'; // Extra space for ads + safe area on mobile
      } else if (hasAds) {
        classes += ' pb-20'; // Space for ads on desktop
      } else if (isMobile && hasSafeArea) {
        classes += ' pb-20'; // Safe area padding on mobile without ads
      } else {
        classes += ' pb-16'; // Standard padding when no ads
      }
      break;
    }
    case NAVIGATION_STYLES.SIDE:
      classes += ' pl-0 md:pl-64'; // Responsive side navigation padding
      break;
    case NAVIGATION_STYLES.FLOATING:
      classes += ' pb-6'; // Slightly more space for floating nav
      break;
    default: {
      const defaultHasAds = showAds() && isAuthenticated;
      classes += defaultHasAds ? ' pb-20' : ' pb-16';
      break;
    }
    }
    
    // Add safe area padding for iOS devices with enhanced support
    classes += ' safe-area-padding';
    
    // Add scroll padding for better scrolling experience
    classes += ' scroll-padding';
    
    return classes;
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Show subscription banner at the very top */}
      {showSubscriptionBanner && <SubscriptionBanner />}
      
      {/* Show global header if needed */}
      {showGlobalHeader && <Header />}
      
      {/* Main content area with proper spacing */}
      <main className={getContentClasses()}>
        <Outlet />
      </main>
      
      {/* Navigation */}
      {renderNavigation()}
      
      {/* Footer */}
      {showFooter && <Footer />}
      
      {/* Service Worker Update Notification */}
      <ServiceWorkerUpdate />
      
      {/* Bottom banner ad - Removed due to interference issues */}
    </div>
  );
};

export default Layout;
