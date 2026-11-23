/* DP Construction PWA: keep the app shell available without altering form/PDF logic. */
const CACHE_NAME = 'dp-construction-shell-v5';
const APP_SHELL = [
    './', './index.html', './manifest.webmanifest',
    './assets/dp-construction-logo.svg',
    './assets/app-icon-192.png', './assets/app-icon-512.png'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys()
            .then(names => Promise.all(names.filter(name => name.startsWith('dp-construction-shell-') && name !== CACHE_NAME).map(name => caches.delete(name))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', function (event) {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).then(response => {
                if (response.ok) {
                    const copy = response.clone();
                    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy)));
                }
                return response;
            }).catch(() => caches.match('./index.html'))
        );
        return;
    }
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
