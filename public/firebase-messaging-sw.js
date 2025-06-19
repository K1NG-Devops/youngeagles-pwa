// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyABl23C2T_smbFQgTypZ0cfii3faawwoe8",
  authDomain: "skydekstorage.firebaseapp.com",
  projectId: "skydekstorage",
  storageBucket: "skydekstorage.firebasestorage.app",
  messagingSenderId: "482749285321",
  appId: "1:482749285321:web:3864dec67deca22f885e18",
  measurementId: "G-ZLBW552T6P"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Young Eagles Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: '/pwa-192x192.png',
    badge: '/pwa-96x96.png',
    tag: payload.data?.type || 'default',
    data: payload.data,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/pwa-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
    silent: false
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return; // Just close the notification
  }
  
  // Handle view action or direct notification click
  const data = event.notification.data;
  let url = '/';
  
  switch(data?.type) {
    case 'homework':
      url = '/student/homework';
      break;
    case 'event':
      url = '/year-planner';
      break;
    case 'notification':
      url = '/notifications';
      break;
    case 'attendance':
      url = '/dashboard';
      break;
    case 'message':
      url = '/notifications';
      break;
    default:
      url = '/dashboard';
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      // Check if there's already a window open with the target URL
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', function(event) {
  console.log('[firebase-messaging-sw.js] Notification closed:', event.notification.tag);
});

