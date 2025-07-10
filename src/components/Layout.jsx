import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';
import SideNavigation from './SideNavigation';
import TopNavigation from './TopNavigation';
import FloatingNavigation from './FloatingNavigation';
import Footer from './Footer';
import SubscriptionBanner from './subscription/SubscriptionBanner';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Layout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
    
  // Hide navigation on login page
  const showNavigation = isAuthenticated && location.pathname !== '/login';
    
  // Show header only on pages that don't have their own header section
  const showGlobalHeader = isAuthenticated && location.pathname !== '/dashboard';
    
  // Show footer only on specific public/marketing pages, not in authenticated app areas
  const publicPages = ['/', '/login', '/signup', '/privacy-policy', '/terms-of-service', '/contact', '/about', '/help'];
  const showFooter = !isAuthenticated && publicPages.includes(location.pathname);

  // Show subscription banner for authenticated users
  const showSubscriptionBanner = isAuthenticated && location.pathname !== '/login' && location.pathname !== '/signup';

  // NAVIGATION STYLE CONFIGURATION
  // Change this value to switch navigation styles:
  // 'bottom' - Bottom navigation (current)
  // 'side' - Side drawer navigation
  // 'top' - Top navigation bar
  // 'floating' - Floating action button
  const navigationStyle = 'floating';

  const renderNavigation = () => {
    if (!showNavigation) return null;

    switch (navigationStyle) {
    case 'side':
      return <SideNavigation />;
    case 'top':
      return <TopNavigation />;
    case 'floating':
      return <FloatingNavigation />;
    case 'bottom':
    default:
      return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <Navigation />
        </div>
      );
    }
  };

  const getMainContentClasses = () => {
    // Special handling for dashboard pages to go edge-to-edge
    const isFullWidth = location.pathname === '/dashboard' || location.pathname === '/teacher-dashboard';
    
    // Add bottom margin for fixed footer (footer height is ~70px)
    const footerMargin = showFooter ? 'mb-20' : 'mb-4';
    
    // Add top margin for subscription banner if shown
    const bannerMargin = showSubscriptionBanner ? 'mt-2' : '';
    
    if (!showNavigation) {
      return `min-h-full ${footerMargin} ${bannerMargin}`;
    }
    
    switch (navigationStyle) {
    case 'side':
      return `min-h-full ${footerMargin} ${bannerMargin}`;
    case 'top':
      return `min-h-full ${footerMargin} ${bannerMargin}`;
    case 'floating':
      return `min-h-full ${footerMargin} pb-20 ${bannerMargin}`; // Extra padding for floating nav
    case 'bottom':
    default:
      return `min-h-full mb-28 ${footerMargin} ${bannerMargin}`; // Extra margin for both bottom navigation and footer
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Subscription Banner */}
      {showSubscriptionBanner && (
        <SubscriptionBanner 
          position="top"
          showOnActive={false}
          dismissible={true}
        />
      )}
      
      {/* Only show Header if not using top navigation */}
      {showGlobalHeader && navigationStyle !== 'top' && <Header />}
      
      {/* Top Navigation (if selected) */}
      {navigationStyle === 'top' && showNavigation && <TopNavigation />}
      
      {/* Main content area with proper flex behavior */}
      <main className="flex-1">
        <div className={getMainContentClasses()}>
          {/* Conditionally wrap content with max-width container */}
          {location.pathname === '/dashboard' || location.pathname === '/teacher-dashboard' || location.pathname === '/activities' ? (
            <Outlet />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          )}
        </div>
      </main>
      
      {/* Render navigation based on style */}
      {renderNavigation()}
      
      {/* Render footer on public pages */}
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
