import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';
import SideNavigation from './SideNavigation';
import TopNavigation from './TopNavigation';
import FloatingNavigation from './FloatingNavigation';
import Footer from './Footer';
import SubscriptionBanner from './subscription/SubscriptionBanner';
import BottomBannerAd from './ads/BottomBannerAd';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';

const Layout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const { showAds } = useSubscription();
  
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
    if (!isAuthenticated) return null;

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

  // Calculate padding based on components present
  const getPaddingClasses = () => {
    let classes = 'p-4';
    
    if (showGlobalHeader) classes += ' pt-16';
    if (navigationStyle === 'bottom') classes += ' pb-24';
    if (showAds()) classes += ' pb-32'; // Extra padding for banner ad
    
    return classes;
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Show subscription banner at the very top */}
      {showSubscriptionBanner && <SubscriptionBanner />}
      
      {/* Show global header if needed */}
      {showGlobalHeader && <Header />}
      
      {/* Main content area */}
      <main className={`flex-grow ${getPaddingClasses()}`}>
        <Outlet />
      </main>
      
      {/* Navigation */}
      {renderNavigation()}
      
      {/* Footer */}
      {showFooter && <Footer />}
      
      {/* Banner Ad - rendered last to ensure proper z-index */}
      {showAds() && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <BottomBannerAd />
        </div>
      )}
    </div>
  );
};

export default Layout;
