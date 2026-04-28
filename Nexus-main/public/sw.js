// Service Worker disabled in development to prevent fetch errors
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

