// Service worker Antar Hemat: hanya supaya aplikasi bisa dipasang di HP dan halaman utama
// tetap terbuka saat sinyal putus sebentar. Data (Firestore, peta) TIDAK disimpan di sini.
const CACHE = 'antar-hemat-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;           // Firebase, Google Maps, font: langsung ke internet
  if (req.mode === 'navigate') {
    // Hanya halaman utama yang disimpan untuk cadangan offline. Halaman lain (mis. lokasi.html) selalu dari internet.
    const halamanUtama = url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
    if (!halamanUtama) return;
    e.respondWith(fetch(req).then((r) => {
      if (r.ok) { const c = r.clone(); caches.open(CACHE).then((x) => x.put('./index.html', c)).catch(() => {}); }
      return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  if (SHELL.some((p) => url.pathname.endsWith(p.replace('./', '/')))) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
  }
});
