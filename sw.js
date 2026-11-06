// Service worker : fonctionne hors connexion.
// Réseau d'abord pour l'application et les leçons (toujours à jour), cache en secours hors ligne.
// Cache d'abord pour les fichiers audio (lourds, jamais modifiés).
const CACHE = 'jetform-v2';
const SHELL = ['./','index.html','css/style.css','js/app.js','manifest.webmanifest','data/modules.json','data/business.json','data/english.json','assets/svg/chain.svg','assets/svg/quote.svg','assets/svg/models.svg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const store = res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
  if (req.url.endsWith('.mp3')) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(store)));
  } else {
    e.respondWith(fetch(req).then(store).catch(() => caches.match(req)));
  }
});
