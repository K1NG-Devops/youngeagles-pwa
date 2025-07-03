import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';
import SideNavigation from './SideNavigation';
import TopNavigation from './TopNavigation';
import FloatingNavigation from './FloatingNavigation';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';

const Layout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  
  // Hide navigation on login page
  const showNavigation = isAuthenticated && location.pathname !== '/login';
  
  // Show header only on pages that don't have their own header section
  const showGlobalHeader = isAuthenticated && location.pathname !== '/dashboard';

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
    
    if (!showNavigation) {
      return isFullWidth ? 'h-full pb-4 overflow-y-auto' : 'h-full px-4 sm:px-6 lg:px-8 pb-4 overflow-y-auto';
    }
    
    switch (navigationStyle) {
    case 'side':
      return isFullWidth ? 'h-full pb-4 overflow-y-auto' : 'h-full px-4 sm:px-6 lg:px-8 pb-4 overflow-y-auto';
    case 'top':
      return isFullWidth ? 'h-full pb-4 overflow-y-auto' : 'h-full px-4 sm:px-6 lg:px-8 pb-4 overflow-y-auto';
    case 'floating':
      return isFullWidth ? 'h-full pb-4 overflow-y-auto' : 'h-full px-4 sm:px-6 lg:px-8 pb-4 overflow-y-auto';
    case 'bottom':
    default:
      return isFullWidth ? 'h-full pb-20 overflow-y-auto' : 'h-full px-4 sm:px-6 lg:px-8 pb-20 overflow-y-auto';
    }
  };

  return (
    <div className={`h-screen flex flex-col transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Only show Header if not using top navigation */}
      {showGlobalHeader && navigationStyle !== 'top' && <Header />}
      
      {/* Top Navigation (if selected) */}
      {navigationStyle === 'top' && showNavigation && <TopNavigation />}
      
      {/* Main content area with proper flex behavior */}
      <main className="flex-1 overflow-hidden">
        <div className={getMainContentClasses()}>
          {/* Conditionally wrap content with max-width container */}
          {location.pathname === '/dashboard' || location.pathname === '/teacher-dashboard' ? (
            <Outlet />
          ) : (
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          )}
        </div>
      </main>
      
      {/* Render navigation based on style */}
      {renderNavigation()}
    </div>
  );
};

export default Layout;