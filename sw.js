const CACHE_NAME = 'edusmansa-cache-v40006';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './logo_smansa_clean.png',
  './icon-192x192.png',
  './icon-512x512.png',
  './data/school_data.json',
  './bot-avatar.jpg'
];

// ─── Install: precache all static assets ──────────────────────────────────
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching static assets...');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// ─── Activate: clean up old caches ────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then(cacheNames =>
        Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        )
      )
    ])
  );
});

// ─── Fetch: smart routing strategy ────────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1. Firebase / Google API → Network-only (never cache auth/realtime data)
  const isFirebase =
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('google.com') ||
    url.hostname.includes('firebaseapp.com');

  if (isFirebase) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. Static assets → Cache-first, update cache in background
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached => {
      const networkFetch = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        }
        return networkResponse;
      });
      // Serve from cache instantly if available; fall back to network
      return cached || networkFetch;
    }).catch(() => {
      // Fully offline + not cached: return index.html for page navigations
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
