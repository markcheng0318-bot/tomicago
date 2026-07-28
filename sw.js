const CACHE = 'tomicago-v28';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // 不快取 API 請求或第三方服務
  if (e.request.url.includes('/api/')) return;
  if (e.request.url.includes('firestore') || e.request.url.includes('googleapis') || e.request.url.includes('gstatic')) return;

  // 頁面本身（HTML）一律「先試網路」，確保部署新版本後使用者馬上看得到，
  // 只有離線時才退回快取；其餘靜態資源（圖示等）用「先讀快取」加快載入。
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request).then(cached => cached || caches.match('/index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
