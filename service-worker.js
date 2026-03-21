const CACHE_NAME = 'learn-n-grow-v5';
const APP_SHELL = [
  './',
  './index.html',
  './privacy-policy.html',
  './account-deletion.html',
  './styles.css',
  './app.js',
  './daily-data.js',
  './activity-data.js',
  './firebase-config.js',
  './supabase-config.js',
  './manifest.webmanifest',
  './logo.png',
  './fluent-bot.png',
  './khushi-bot.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

const RUNTIME_CACHEABLE_HOSTS = new Set([
  'cdn.tailwindcss.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'unpkg.com',
  'cdn.jsdelivr.net',
  'www.gstatic.com'
]);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isRuntimeStatic = RUNTIME_CACHEABLE_HOSTS.has(requestUrl.hostname);

  if (!isSameOrigin && !isRuntimeStatic) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone).catch(() => {
              // Ignore opaque or transient cache write failures.
            });
          });
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
