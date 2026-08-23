const CACHE_NAME = 'hello-world-pwa-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Установка: скачиваем файлы в кэш
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Кэшируем ресурсы');
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting(); // Активируем worker сразу
});

// Активация: удаляем старый кэш, если обновилась версия
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('Удаляем старый кэш:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Берем управление над страницей сразу
});

// Перехват запросов: отдаем файлы из кэша, если они там есть
self.self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Если файл есть в кэше — отдаем его, иначе идем в сеть
            return cachedResponse || fetch(event.request);
        })
    );
});
