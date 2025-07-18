const CACHE_NAME = "young-eagles-pwa-v1"
const urlsToCache = ["/", "/dashboard", "/static/js/bundle.js", "/static/css/main.css", "/manifest.json"]

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

// Fetch event
self.addEventListener("fetch", (event) => {
  // Skip ads requests from caching
  if (event.request.url.includes("googlesyndication.com") || event.request.url.includes("googletagservices.com")) {
    return fetch(event.request)
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request)
    }),
  )
})
