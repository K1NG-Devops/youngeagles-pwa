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

  // Calculate proper padding for clean layout
  const getContentClasses = () => {
    let classes = 'flex-grow relative';
    
    // Add padding based on what's showing
    if (showGlobalHeader) {
      classes += ' pt-16';
    } else {
      classes += ' pt-0';
    }
    
    if (showSubscriptionBanner) {
      classes += ' pt-10';
    }
    
    // Add padding based on navigation style
    switch (navigationStyle) {
    case NAVIGATION_STYLES.TOP:
      classes += ' pt-16'; // Top navigation needs top padding
      break;
    case NAVIGATION_STYLES.BOTTOM:
      // Bottom padding for tab navigation
      classes += ' pb-20'; // Proper padding for bottom navigation
      break;
    case NAVIGATION_STYLES.SIDE:
      classes += ' pl-0'; // Side navigation doesn't need padding as it's overlay
      break;
    case NAVIGATION_STYLES.FLOATING:
      classes += ' pb-6'; // Minimal padding for floating navigation
      break;
    default:
      classes += ' pb-20';
    }
    
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
