/* Service worker: guarda toda la app para que funcione sin internet */
const CACHE = 'guacofit-v2';
const FILES = ['./', 'index.html', 'manifest.json', 'css/style.css', 'js/recipes.js', 'js/steps.js', 'js/exercise.js', 'js/dishes.js', 'js/app.js', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
  'fonts/fredoka-latin-wght-normal.woff2', 'fonts/chewy-latin-400-normal.woff2', 'fonts/caveat-brush-latin-400-normal.woff2', 'fonts/nunito-latin-wght-normal.woff2'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
// Con internet baja siempre la versión más nueva; sin internet usa lo guardado.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || caches.match('index.html'))));
});
