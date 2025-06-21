// Service Worker Registration
// This file handles the registration and lifecycle of the service worker

const SW_CONFIG = {
  // Only register SW in production or when explicitly enabled
  ENABLE_SW: import.meta.env.PROD || import.meta.env.VITE_ENABLE_SW === 'true',
  SW_PATH: '/sw.js',
  SCOPE: '/'
};

export async function registerServiceWorker() {
  if (!SW_CONFIG.ENABLE_SW) {
    console.log('🔧 Service Worker disabled in development');
    return;
  }

  if (!('serviceWorker' in navigator)) {
    console.warn('🚫 Service Worker not supported');
    return;
  }

  try {
    console.log('📦 Registering Service Worker...');
    
    const registration = await navigator.serviceWorker.register(
      SW_CONFIG.SW_PATH,
      { scope: SW_CONFIG.SCOPE }
    );

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🔄 New Service Worker available');
            // Optionally show update notification to user
            showUpdateNotification();
          }
        });
      }
    });

    console.log('✅ Service Worker registered successfully');
    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
  }
}

function showUpdateNotification() {
  // Show a toast or modal to inform user about update
  if (window.toast) {
    window.toast.info('New version available! Refresh to update.');
  }
}

// Auto-register on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', registerServiceWorker);
} 