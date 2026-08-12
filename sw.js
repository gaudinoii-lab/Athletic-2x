const CACHE_NAME = 'athletic2x-v3.0.0';
const BASE = new URL('./', self.location.href);
const FILES = [
  './',
  './index.html',
  './style-v3.css',
  './workout-data-v3.js',
  './app-v3.js',
  './manifest-v3.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
].map(path => new URL(path, BASE).href);

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('athletic2x-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      // Network-first: su GitHub Pages gli aggiornamenti arrivano subito quando sei online.
      const response = await fetch(request, { cache: 'no-cache' });
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    } catch {
      const cached = await cache.match(request, { ignoreSearch: true });
      if (cached) return cached;
      if (request.mode === 'navigate') return cache.match(new URL('./index.html', BASE).href);
      return Response.error();
    }
  })());
});
