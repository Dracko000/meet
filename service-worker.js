// Service Worker for PWA functionality
const CACHE_NAME = 'convertation-v1.0.0';
const urlsToCache = [
    '/',
    '/index.php',
    '/css/style.css',
    '/js/config.js',
    '/js/webrtc.js',
    '/js/main.js',
    '/js/chat.js',
    '/js/pwa.js',
    '/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve cached resources when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    return response;
                }
                
                // Else make network request
                return fetch(event.request)
                    .then(response => {
                        // Check if we received a valid response
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response for caching
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(error => {
                        // Handle offline scenario
                        console.error('Fetch failed:', error);
                        
                        // Try to return offline fallback if available
                        if (event.request.destination === 'document') {
                            return caches.match('/');
                        }
                    });
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Handle push notifications if needed
self.addEventListener('push', event => {
    // Handle push notifications
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    // Focus or open the app
    event.waitUntil(
        clients.openWindow('/')
    );
});