const CACHE_NAME = "young-eagles-pwa-v1"
const urlsToCache = [
  "/",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
]

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Fetch event
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests and ad requests
  if (
    !event.request.url.startsWith(self.location.origin) ||
    event.request.url.includes("googlesyndication") ||
    event.request.url.includes("googletagmanager") ||
    event.request.url.includes("doubleclick")
  ) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      if (response) {
        return response
      }
      return fetch(event.request)
    }),
  )
})

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Handle background sync for offline ad tracking
self.addEventListener("sync", (event) => {
  if (event.tag === "ad-interaction-sync") {
    event.waitUntil(syncAdInteractions())
  }
})

async function syncAdInteractions() {
  try {
    // Get stored ad interactions from IndexedDB
    const interactions = await getStoredAdInteractions()

    // Send to analytics when back online
    for (const interaction of interactions) {
      await fetch("/api/analytics/ad-interaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(interaction),
      })
    }

    // Clear stored interactions after successful sync
    await clearStoredAdInteractions()
  } catch (error) {
    console.error("Failed to sync ad interactions:", error)
  }
}

// Helper functions for IndexedDB operations
async function getStoredAdInteractions() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("AdInteractionsDB", 1)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(["interactions"], "readonly")
      const store = transaction.objectStore("interactions")
      const getAllRequest = store.getAll()

      getAllRequest.onsuccess = () => resolve(getAllRequest.result)
      getAllRequest.onerror = () => reject(getAllRequest.error)
    }

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains("interactions")) {
        db.createObjectStore("interactions", { keyPath: "id", autoIncrement: true })
      }
    }
  })
}

async function clearStoredAdInteractions() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("AdInteractionsDB", 1)

    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(["interactions"], "readwrite")
      const store = transaction.objectStore("interactions")
      const clearRequest = store.clear()

      clearRequest.onsuccess = () => resolve()
      clearRequest.onerror = () => reject(clearRequest.error)
    }
  })
}
