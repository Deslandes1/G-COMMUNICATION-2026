const CACHE_VERSION = 'g-comm-v3';
const CORE_ASSETS = [
'./',
'./index.html',
'./manifest.json',
'./404.html'
];

self.addEventListener('install', event => {
event.waitUntil(
caches.open(CACHE_VERSION)
.then(cache => cache.addAll(CORE_ASSETS).catch(err => console.warn('Cache addAll failed:', err)))
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

// Bypass cross-origin requests (like Firebase & Google APIs) to ensure fresh realtime connection
if (url.origin !== location.origin) return;

// Navigation requests: Network first, falling back to cache, then index.html SPA shell
if (req.mode === 'navigate') {
event.respondWith(
fetch(req)
.then(res => {
const copy = res.clone();
caches.open(CACHE_VERSION).then(c => c.put(req, copy));
return res;
})
.catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
);
return;
}

// Static assets: Cache first, falling back to network and updating cache
event.respondWith(
caches.match(req).then(cached => {
if (cached) {
// Fetch in background to update cache (stale-while-revalidate pattern)
fetch(req).then(res => {
if (res.ok) {
caches.open(CACHE_VERSION).then(c => c.put(req, res));
}
}).catch(() => {});
return cached;
}
return fetch(req).then(res => {
if (res.ok) {
const copy = res.clone();
caches.open(CACHE_VERSION).then(c => c.put(req, copy));
}
return res;
}).catch(() => caches.match('./404.html'));
})
);
});
