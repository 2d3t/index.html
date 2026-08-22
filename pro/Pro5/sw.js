const CACHE_NAME = 'pro5-v1';
const FILES_TO_CACHE = [
    './',                    // ← ТОЧКА с СЛЕШЕМ (текущая папка)
    './index.html',
    './manifest.json'
    // если есть другие файлы (style.css, app.js) — добавь их сюда
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Кэшируем Pro5...');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        console.log('[SW] Удаляем старый кэш:', name);
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).catch(() => {
                    return new Response('Нет интернета', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
    );
});