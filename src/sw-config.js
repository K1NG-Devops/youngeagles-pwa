// Service Worker Configuration
// This file defines the caching strategies for the PWA

export const SW_CONFIG = {
  // API endpoints to cache
  API_ROUTES: {
    // Production API
    PRODUCTION: 'https://youngeagles-api-server.up.railway.app/api',
    // Only cache localhost in development
    LOCAL: import.meta.env.DEV ? 'http://localhost:3001/api' : null
  },
  
  // Cache strategies
  CACHE_STRATEGIES: {
    API: {
      strategy: 'NetworkFirst',
      cacheName: 'api-cache',
      networkTimeoutSeconds: 10,
      maxEntries: 100,
      maxAgeSeconds: 86400 // 24 hours
    },
    IMAGES: {
      strategy: 'CacheFirst',
      cacheName: 'images',
      maxEntries: 60,
      maxAgeSeconds: 2592000 // 30 days
    },
    STATIC: {
      strategy: 'StaleWhileRevalidate',
      cacheName: 'static-resources',
      maxEntries: 60,
      maxAgeSeconds: 86400 // 24 hours
    },
    NAVIGATION: {
      strategy: 'NetworkFirst',
      cacheName: 'navigations',
      networkTimeoutSeconds: 3,
      maxEntries: 30,
      maxAgeSeconds: 3600 // 1 hour
    }
  },
  
  // Background sync configuration
  BACKGROUND_SYNC: {
    queueName: 'apiQueue',
    maxRetentionTime: 1440 // 24 hours in minutes
  }
};

export default SW_CONFIG; 