// Service Worker for YoungEagles PWA
// Handles push notifications, caching, and background sync

const CACHE_NAME = 'young-eagles-v1.0.2';
const RUNTIME_CACHE = 'young-eagles-runtime';
const STATIC_CACHE = 'young-eagles-static';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache resources and skip waiting for faster updates
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event');
  event.waitUntil(
    Promise.all([
      // Cache app shell
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      }),
      
      // Initialize runtime cache
      caches.open(RUNTIME_CACHE),
      caches.open(STATIC_CACHE)
    ]).then(() => {
      console.log('Service Worker: All caches initialized');
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches and notify clients of updates
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![CACHE_NAME, RUNTIME_CACHE, STATIC_CACHE].includes(cacheName)) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients immediately
      self.clients.claim().then(() => {
        console.log('Service Worker: Now controlling all clients');
        
        // Notify all clients that a new service worker is active
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_UPDATED',
              message: 'Service Worker has been updated'
            });
          });
        });
      })
    ])
  );
});

// Fetch event - network-first strategy for faster updates
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // Handle different types of requests with appropriate strategies
  if (url.origin === location.origin) {
    // For same-origin requests, use network-first strategy
    event.respondWith(networkFirst(event.request));
  } else {
    // For external resources (ads, fonts, etc.), use cache-first
    event.respondWith(cacheFirst(event.request));
  }
});

// Network-first strategy for app resources
async function networkFirst(request) {
  const cacheName = request.url.includes('/static/') ? STATIC_CACHE : RUNTIME_CACHE;
  
  try {
    // Try network first
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful responses
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Network failed, try cache
    console.log('Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If both fail and it's a document request, return offline page
    if (request.destination === 'document') {
      return caches.match('/') || new Response('Offline', { status: 503 });
    }
    
    throw error;
  }
}

// Cache-first strategy for external resources
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Return cached version and update in background
    updateInBackground(request);
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Failed to fetch resource:', request.url, error);
    return new Response('Resource unavailable', { status: 503 });
  }
}

// Update cache in background
async function updateInBackground(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response);
    }
  } catch (error) {
    // Silent fail for background updates
  }
}

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