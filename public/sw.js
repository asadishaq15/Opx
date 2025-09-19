// Service Worker for caching 3D assets
const CACHE_NAME = 'opx-3d-assets-v1'
const ASSETS_TO_CACHE = [
  '/models/OPX.glb',
  '/models/falcon/falcon.glb',
  '/models/palm/scene-v2.glb',
  '/assets/O.png',
  '/assets/fake_verthandi.mp3'
]

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching 3D assets')
        return cache.addAll(ASSETS_TO_CACHE)
      })
      .catch((error) => {
        console.warn('Failed to cache some assets:', error)
      })
  )
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache first
self.addEventListener('fetch', (event) => {
  // Only cache our specific 3D assets
  const url = new URL(event.request.url)
  const isAsset = ASSETS_TO_CACHE.some(asset => url.pathname.endsWith(asset))
  
  if (isAsset) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version if available
          if (response) {
            console.log('Serving from cache:', url.pathname)
            return response
          }
          
          // Otherwise fetch and cache
          return fetch(event.request).then((response) => {
            // Don't cache if not successful
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }
            
            const responseToCache = response.clone()
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })
            
            return response
          })
        })
    )
  }
})