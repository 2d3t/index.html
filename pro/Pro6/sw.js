// ============================================================
// SERVICE WORKER для QR File Transfer (Pro6)
// Полностью автономная работа с локальными библиотеками
// ============================================================

const CACHE_NAME = 'qr-transfer-v1';

// ВСЕ файлы, которые нужны для офлайн-работы
const FILES_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './qrcode.js',
    './html5-qrcode.js'
];

// ============================================================
// УСТАНОВКА — кэшируем все файлы
// ============================================================
self.addEventListener('install', (event) => {
    console.log('[SW] Установка...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Кэшируем файлы...');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => {
                console.log('[SW] Все файлы закэшированы!');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Ошибка кэширования:', error);
            })
    );
});

// ============================================================
// АКТИВАЦИЯ — удаляем старые кэши
// ============================================================
self.addEventListener('activate', (event) => {
    console.log('[SW] Активация...');

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
        }).then(() => {
            console.log('[SW] Готов к работе!');
            return self.clients.claim();
        })
    );
});

// ============================================================
// ПЕРЕХВАТ ЗАПРОСОВ — отдаём из кэша или из сети
// ============================================================
self.addEventListener('fetch', (event) => {
    // Пропускаем запросы к внешним API (если нужны)
    const url = new URL(event.request.url);

    // Если запрос к внешнему ресурсу (не наш домен) — пробуем только сеть
    if (url.origin !== self.location.origin) {
        // Для внешних ресурсов пробуем сеть, если нет — ошибка
        event.respondWith(
            fetch(event.request).catch(() => {
                return new Response('Внешний ресурс недоступен офлайн', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            })
        );
        return;
    }

    // Для локальных файлов — сначала кэш, потом сеть
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Нашли в кэше — отдаём
                    return cachedResponse;
                }

                // Нет в кэше — идём в сеть
                return fetch(event.request)
                    .then((response) => {
                        // Сохраняем успешный ответ в кэш для будущих запросов
                        if (!response || response.status !== 200) {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            })
                            .catch((err) => console.warn('[SW] Не удалось сохранить в кэш:', err));

                        return response;
                    })
                    .catch(() => {
                        // Нет интернета и нет в кэше
                        return new Response('Нет интернета', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// ============================================================
// ОБРАБОТКА СООБЩЕНИЙ ОТ СТРАНИЦЫ
// ============================================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('[SW] Service Worker загружен!');