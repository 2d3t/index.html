const CACHE_NAME = 'qr-transfer-v1';
const FILES_TO_CACHE = [
    './',
    './index.html',
    './manifest.json'
    // Внешние библиотеки (qrcode, html5-qrcode) будут загружены из CDN,
    // но для полной офлайн-работы их нужно скачать и добавить сюда
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
                    // Если нет интернета и файла нет в кэше
                    return new Response('Нет интернета', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
    );
});