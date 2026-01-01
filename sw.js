const CACHE_NAME = 'w40k-layout-manager-v1';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourne depuis le cache si disponible
        if (response) {
          return response;
        }

        // Sinon, fait la requête réseau
        return fetch(event.request).then((response) => {
          // Ne cache que les requêtes réussies
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone la réponse pour la mettre en cache
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // En cas d'erreur (hors ligne), retourne une page d'erreur basique
        return new Response('Application hors ligne. Veuillez vous reconnecter pour charger les ressources.', {
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});
