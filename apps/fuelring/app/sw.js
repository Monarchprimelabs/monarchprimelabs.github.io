// FuelRing web app: works offline after the first visit.
// build.js fills in the version (a hash of the files) and the file list, so
// every release gets a new cache and the old one is dropped.
const VERSION = '2f2252527c5f';
const CACHE = 'fuelring-' + VERSION;
const FILES = ["./","./index.html","./manifest.webmanifest","./icons/apple-touch-icon.png","./icons/favicon-32.png","./icons/icon-192.png","./icons/icon-512.png"];

// cache: 'reload' skips the browser's HTTP cache (GitHub Pages lets it keep a
// page for 10 minutes), so a new version never stores the previous index.html
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE)
    .then(cache => cache.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('fuelring-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()));
});

// Only this app's own files are served from the cache. Anything else (the one
// online call, the Open Food Facts barcode lookup) goes to the network as if
// there were no service worker, and is never stored.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(req, { ignoreSearch: true })
        // a launch from the Home Screen is a navigation to the app page, whatever the query
        .then(hit => hit || (req.mode === 'navigate' ? cache.match('./') : undefined))
        .then(hit => hit || fetch(req))));
});
