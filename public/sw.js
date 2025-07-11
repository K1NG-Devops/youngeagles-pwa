// Service Worker for YoungEagles PWA
// Handles push notifications, caching, and background sync

const CACHE_NAME = 'young-eagles-v1.0.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: App shell cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Cache cleanup complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, return offline page
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received');
  
  let notificationData = {
    title: 'Young Eagles Notification',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'young-eagles-notification',
    data: {}
  };

  // Parse notification data if available
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        ...notificationData,
        ...payload
      };
    } catch (e) {
      console.error('Service Worker: Error parsing push data:', e);
      notificationData.body = event.data.text();
    }
  }

  // Add notification actions based on type
  if (notificationData.data.type === 'homework') {
    notificationData.actions = [
      {
        action: 'view',
        title: 'View Homework',
        icon: '/icons/icon-48x48.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/icon-48x48.png'
      }
    ];
  } else if (notificationData.data.type === 'grading') {
    notificationData.actions = [
      {
        action: 'view',
        title: 'View Grade',
        icon: '/icons/icon-48x48.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/icon-48x48.png'
      }
    ];
  } else if (notificationData.data.type === 'announcement') {
    notificationData.actions = [
      {
        action: 'view',
        title: 'View Announcement',
        icon: '/icons/icon-48x48.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/icon-48x48.png'
      }
    ];
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: notificationData.requireInteraction || false,
      silent: false,
      timestamp: Date.now()
    })
  );
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click event');
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  // Close the notification
  notification.close();

  // Handle different actions
  if (action === 'dismiss') {
    console.log('Service Worker: Notification dismissed');
    return;
  }

  // Determine URL to open based on notification type
  let urlToOpen = '/';
  
  if (data.url) {
    urlToOpen = data.url;
  } else if (data.type === 'homework') {
    urlToOpen = data.homeworkId ? `/homework/${data.homeworkId}` : '/homework';
  } else if (data.type === 'grading') {
    urlToOpen = data.submissionId ? `/homework/submissions/${data.submissionId}` : '/homework';
  } else if (data.type === 'announcement') {
    urlToOpen = '/notifications';
  }

  // Open the app or focus existing tab
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          // Focus existing tab and navigate
          return client.focus().then(() => {
            return client.navigate(urlToOpen);
          });
        }
      }
      
      // Open new tab if app is not open
      return clients.openWindow(urlToOpen);
    })
  );
});

// Background sync event - handle offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync event:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      Promise.resolve()
        .then(() => {
          console.log('Service Worker: Background sync completed');
        })
        .catch((error) => {
          console.error('Service Worker: Background sync failed:', error);
        })
    );
  }
});

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Send response back to main thread
  event.ports[0].postMessage({
    type: 'SW_RESPONSE',
    message: 'Service Worker received message'
  });
});

// Error event - handle service worker errors
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error event:', event.error);
});

// Unhandled rejection event
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled rejection:', event.reason);
});

console.log('Service Worker: Script loaded and ready'); 