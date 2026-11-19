// Service worker: guarda la app en caché para que abra sin conexión.
const CACHE = 'calendario-adviento-v1';
const ROOT = self.registration.scope;
const VAULT = `${ROOT}calendario.enc.json`;
const SHELL = [
  ROOT,
  VAULT,
  `${ROOT}manifest.webmanifest`,
  `${ROOT}icon-192.png`,
  `${ROOT}apple-touch-icon.png`,
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

/** Primero la red (para recibir sorpresas nuevas) y, sin conexión, la copia guardada. */
function networkFirst(request, cacheKey) {
  return fetch(request)
    .then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(cacheKey, copy));
      }
      return response;
    })
    .catch(() => caches.match(cacheKey));
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, ROOT));
    return;
  }

  // El calendario cifrado cambia cada vez que se añaden sorpresas: nunca se sirve una copia vieja si hay red.
  if (`${url.origin}${url.pathname}` === VAULT) {
    event.respondWith(networkFirst(request, VAULT));
    return;
  }

  // Scripts, estilos, fuentes e iconos llevan hash en el nombre: si ya están guardados, se usan directamente.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
