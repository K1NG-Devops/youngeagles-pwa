/* global caches, CustomEvent */

/**
 * Development Helper Utilities
 * Functions to help with development cache issues and debugging
 */

/**
 * Clear all caches and force reload page
 * Useful for development when changes aren't reflecting
 */
export const clearCacheAndReload = () => {
  if (import.meta.env.DEV) {
    console.log('🧹 Clearing development caches...');
    
    // Clear localStorage
    try {
      localStorage.clear();
      console.log('✅ localStorage cleared');
    } catch (e) {
      console.warn('❌ Could not clear localStorage:', e);
    }
    
    // Clear sessionStorage
    try {
      sessionStorage.clear();
      console.log('✅ sessionStorage cleared');
    } catch (e) {
      console.warn('❌ Could not clear sessionStorage:', e);
    }
    
    // Clear service worker cache if available
    if ('serviceWorker' in navigator && 'caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
        console.log('✅ Service worker caches cleared');
      });
    }
    
    // Force reload without cache
    setTimeout(() => {
      window.location.reload(true);
    }, 100);
  }
};

/**
 * Log component render for debugging
 */
export const logRender = (componentName, props = {}) => {
  if (import.meta.env.DEV) {
    console.log(`🔄 ${componentName} rendered:`, props);
  }
};

/**
 * Force refresh profile picture by clearing auth context and reloading
 */
export const refreshProfilePicture = () => {
  if (import.meta.env.DEV) {
    console.log('🖼️ Refreshing profile picture...');
    
    // Force re-render by updating timestamp in auth context
    const event = new CustomEvent('force-auth-refresh');
    window.dispatchEvent(event);
  }
};

/**
 * Debug layout spacing issues
 */
export const debugLayout = () => {
  if (import.meta.env.DEV) {
    console.log('🎨 Layout Debug Mode Activated');
    
    // Add debug borders to all elements
    const style = document.createElement('style');
    style.innerHTML = `
      * { outline: 1px solid rgba(255, 0, 0, 0.2) !important; }
      .space-y-3 > * + * { background: rgba(0, 255, 0, 0.1) !important; }
      .flex-gap > * { outline: 2px solid blue !important; }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
      document.head.removeChild(style);
      console.log('🎨 Layout Debug Mode Deactivated');
    }, 5000);
  }
};

// Add global development shortcuts
if (import.meta.env.DEV) {
  // Add keyboard shortcuts for development
  window.addEventListener('keydown', (e) => {
    // Ctrl + Shift + R = Clear cache and reload
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
      e.preventDefault();
      clearCacheAndReload();
    }
    
    // Ctrl + Shift + D = Debug layout
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      debugLayout();
    }
    
    // Ctrl + Shift + P = Refresh profile picture
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
      e.preventDefault();
      refreshProfilePicture();
    }
  });
  
  // Make functions available globally for console debugging
  window.devHelper = {
    clearCacheAndReload,
    refreshProfilePicture,
    debugLayout,
    logRender
  };
  
  console.log('🛠️ Development helpers loaded. Available shortcuts:');
  console.log('   Ctrl+Shift+R: Clear cache & reload');
  console.log('   Ctrl+Shift+D: Debug layout spacing');
  console.log('   Ctrl+Shift+P: Refresh profile picture');
  console.log('   Available in console: window.devHelper');
} 