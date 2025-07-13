/**
 * Device detection utilities
 */

// Check if the device is mobile
export const isMobileDevice = () => {
  // Check user agent
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Mobile device patterns
  const mobilePatterns = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i
  ];
  
  // Check if any mobile pattern matches
  const isMobileUserAgent = mobilePatterns.some(pattern => pattern.test(userAgent));
  
  // Check screen width (mobile typically < 768px)
  const isMobileScreen = window.innerWidth < 768;
  
  // Check touch capability
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Combine checks - if any indicate mobile, consider it mobile
  return isMobileUserAgent || (isMobileScreen && isTouchDevice);
};

// Check if the device is tablet
export const isTabletDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Tablet patterns
  const tabletPatterns = [
    /iPad/i,
    /Android(?!.*Mobile)/i, // Android tablets don't have "Mobile" in user agent
    /Kindle/i,
    /Silk/i,
    /PlayBook/i
  ];
  
  const isTabletUserAgent = tabletPatterns.some(pattern => pattern.test(userAgent));
  
  // Screen size check for tablets (typically 768px to 1024px)
  const isTabletScreen = window.innerWidth >= 768 && window.innerWidth <= 1024;
  
  return isTabletUserAgent || isTabletScreen;
};

// Check if the device is desktop
export const isDesktopDevice = () => {
  return !isMobileDevice() && !isTabletDevice();
};

// Get device type string
export const getDeviceType = () => {
  if (isMobileDevice()) return 'mobile';
  if (isTabletDevice()) return 'tablet';
  return 'desktop';
};

// Check if top navigation is suitable for current device
export const isTopNavigationSuitable = () => {
  // Top navigation works best on desktop and larger tablets
  return isDesktopDevice() || (isTabletDevice() && window.innerWidth >= 1024);
};

// Get recommended navigation styles based on device
export const getRecommendedNavigationStyles = () => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
  case 'mobile':
    return ['bottom', 'floating'];
  case 'tablet':
    return window.innerWidth >= 1024 ? ['top', 'bottom', 'floating'] : ['bottom', 'floating'];
  case 'desktop':
    return ['top', 'bottom', 'side', 'floating'];
  default:
    return ['bottom', 'floating'];
  }
};
