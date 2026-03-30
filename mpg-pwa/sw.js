/* ============================================================
   MPG Service Worker
   Cache-first for static assets, network-first for HTML pages
   ============================================================ */

const CACHE_NAME = 'mpg-v1';

const PRECACHE_ASSETS = [
  './index.html',
  './about.html',
  './services.html',
  './contact.html',
  './manifest.json',
  './css/tokens.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './js/nav.js',
  './js/pwa.js',
  './js/contact.js',
  './assets/icons/favicon.svg',
  './assets/icons/icon-192.svg',
  './assets/icons/icon-512.svg',
];

// ── Install: Precache static shell ─────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: Clean up old caches ──────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// ── Fetch: Hybrid caching strategy ─────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip cross-origin requests (e.g. Google Fonts CDN)
  if (url.origin !== self.location.origin) return;

  // HTML documents: network-first
  if (request.destination === 'document') {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // Static assets: cache-first
  event.respondWith(cacheFirstWithUpdate(request));
});

// Network-first: try network, fall back to cache, then offline page
async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Offline fallback: serve home page for any uncached document
    return caches.match('./index.html');
  }
}

// Cache-first: serve from cache, update in background, fallback to network
async function cacheFirstWithUpdate(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    console.warn('[SW] Fetch failed:', request.url, err);
    throw err;
  }
}
