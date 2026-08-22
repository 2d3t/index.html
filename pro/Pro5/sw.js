// Версия кэша
const CACHE_NAME = 'notes-app-v1';

// Файлы для кэширования (относительные пути)
const FILES_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './style.css',    // если есть
    './app.js'        // если есть
];

// Установка — кэшируем файлы
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Кэшируем файлы...');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Активация — удаляем старые кэши
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

// Перехват запросов
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