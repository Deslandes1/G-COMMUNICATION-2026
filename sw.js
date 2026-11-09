const CACHE_VERSION = 'g-comm-v5';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './404.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => {
        // Pre-cache core assets gracefully without failing installation if an optional asset is missing
        return Promise.allSettled(
          CORE_ASSETS.map(asset => cache.add(asset).catch(err => console.warn('Optional asset pre-cache skipped:', asset)))
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Bypass all cross-origin requests (Firebase RTDB, Auth, Google APIs, CDNs) to ensure real-time connectivity
  if (url.origin !== location.origin) return;

  // Navigation requests: Network first, falling back to cache, then SPA shell
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Static assets: Stale-while-revalidate with robust error handling
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => null);

      return cached || fetchPromise.then(res => res || caches.match('./404.html')).catch(() => caches.match('./404.html'));
    })
  );
});
