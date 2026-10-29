const CACHE = 'guacoswipe-v1';
const FILES = ['./', 'index.html', 'swipe.css', 'swipe.js', 'manifest.json', '../js/mascots.js', '../fonts/fredoka-latin-wght-normal.woff2', '../fonts/chewy-latin-400-normal.woff2', '../fonts/caveat-brush-latin-400-normal.woff2', '../icons/icon.svg'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('guacoswipe') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then((c) => c.match(e.request, { ignoreSearch: true }).then((hit) => {
    const net = fetch(e.request).then((res) => { if (res && res.ok) c.put(e.request, res.clone()); return res; }).catch(() => null);
    return hit || net.then((r) => r || c.match('index.html'));
  })));
});
