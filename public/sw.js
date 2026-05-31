// sw.js — Service Worker de Nivva
// Estrategia: precache de assets públicos estables + runtime cache para el resto.
// Los bundles de Vite quedan fuera del precache porque usan nombres hasheados.

const CACHE_VERSION = 'nivva-v3';

const APP_SHELL = [
    './',
    './index.html',
    './manifest.json',
    './favicon.ico',
    './icons/icon-192.png',
    './icons/icon-512.png',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then(cache =>
            Promise.allSettled(APP_SHELL.map(url => cache.add(url)))
        ).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_VERSION)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;

            return fetch(event.request).then(response => {
                if (
                    response.ok &&
                    response.type === 'basic' &&
                    event.request.url.startsWith(self.location.origin)
                ) {
                    const clone = response.clone();
                    caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone)).catch(() => {});
                }
                return response;
            }).catch(() => {
                if (event.request.destination === 'document') {
                    return caches.match('./index.html');
                }
                return undefined;
            });
        })
    );
});
