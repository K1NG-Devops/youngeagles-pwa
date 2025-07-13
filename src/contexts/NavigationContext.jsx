import React, { createContext, useContext, useState, useEffect } from 'react';
import { isTopNavigationSuitable, getRecommendedNavigationStyles, getDeviceType } from '../utils/deviceUtils';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  // Navigation style options
  const NAVIGATION_STYLES = {
    BOTTOM: 'bottom',
    TOP: 'top', 
    SIDE: 'side',
    FLOATING: 'floating'
  };

  // Get saved navigation style from localStorage or default to bottom
  const [navigationStyle, setNavigationStyle] = useState(() => {
    const saved = localStorage.getItem('navigationStyle');
    const isValidStyle = saved && Object.values(NAVIGATION_STYLES).includes(saved);
    
    // If saved style is top navigation but device doesn't support it, fall back to bottom
    if (isValidStyle && saved === NAVIGATION_STYLES.TOP && !isTopNavigationSuitable()) {
      return NAVIGATION_STYLES.BOTTOM;
    }
    
    return isValidStyle ? saved : NAVIGATION_STYLES.BOTTOM;
  });

  // Device information
  const [deviceType, setDeviceType] = useState(() => getDeviceType());
  const [isTopNavSuitable, setIsTopNavSuitable] = useState(() => isTopNavigationSuitable());
  const [recommendedStyles, setRecommendedStyles] = useState(() => getRecommendedNavigationStyles());

  // Update device info on window resize
  useEffect(() => {
    const handleResize = () => {
      const newDeviceType = getDeviceType();
      const newIsTopNavSuitable = isTopNavigationSuitable();
      const newRecommendedStyles = getRecommendedNavigationStyles();
      
      setDeviceType(newDeviceType);
      setIsTopNavSuitable(newIsTopNavSuitable);
      setRecommendedStyles(newRecommendedStyles);
      
      // If user is currently using top navigation but device no longer supports it
      if (navigationStyle === NAVIGATION_STYLES.TOP && !newIsTopNavSuitable) {
        setNavigationStyle(NAVIGATION_STYLES.BOTTOM);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigationStyle, NAVIGATION_STYLES.TOP, NAVIGATION_STYLES.BOTTOM]);

  // Save to localStorage whenever style changes
  useEffect(() => {
    localStorage.setItem('navigationStyle', navigationStyle);
  }, [navigationStyle]);

  const updateNavigationStyle = (style) => {
    if (Object.values(NAVIGATION_STYLES).includes(style)) {
      // Check if top navigation is being selected on unsupported device
      if (style === NAVIGATION_STYLES.TOP && !isTopNavSuitable) {
        console.warn('Top navigation is not recommended for this device type');
        return false; // Don't allow the change
      }
      setNavigationStyle(style);
      return true;
    }
    return false;
  };

  const value = {
    navigationStyle,
    setNavigationStyle: updateNavigationStyle,
    NAVIGATION_STYLES,
    // Device information
    deviceType,
    isTopNavSuitable,
    recommendedStyles,
    // Helper functions
    isBottomNav: () => navigationStyle === NAVIGATION_STYLES.BOTTOM,
    isTopNav: () => navigationStyle === NAVIGATION_STYLES.TOP,
    isSideNav: () => navigationStyle === NAVIGATION_STYLES.SIDE,
    isFloatingNav: () => navigationStyle === NAVIGATION_STYLES.FLOATING,
    // Check if a navigation style is available for current device
    isStyleAvailable: (style) => {
      if (style === NAVIGATION_STYLES.TOP) {
        return isTopNavSuitable;
      }
      return recommendedStyles.includes(style);
    }
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationContext;
