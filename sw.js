
const V = 'sea-v1';
const PRECACHE = ["./", "index.html", "unlock.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "itinerary.html", "packing.html", "guide.html", "cards.html", "data/itinerary.bin", "data/packing.bin", "data/guide.bin", "data/cards.bin"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    e.respondWith(caches.match(e.request, {ignoreSearch:true}).then(r => r || fetch(e.request).then(resp => {
      const copy = resp.clone(); caches.open(V).then(c => c.put(e.request, copy)); return resp;
    })));
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      if (resp.ok || resp.type === 'opaque') { const copy = resp.clone(); caches.open(V).then(c => c.put(e.request, copy)); }
      return resp;
    }).catch(() => new Response('', {status: 404}))));
  }
});
