const CACHE = 'tomicago-v29';
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

// ── 推播通知（Firebase Cloud Messaging，App 沒開著時靠這段跳系統通知）──
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCuumH2zglw5Oxqz4bGOx9hOYOmyOopibE",
  authDomain: "tomicago-8e407.firebaseapp.com",
  projectId: "tomicago-8e407",
  storageBucket: "tomicago-8e407.firebasestorage.app",
  messagingSenderId: "728603126879",
  appId: "1:728603126879:web:5c3e171a4e68b5bdffbfea",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'TomicaGo', {
    body: body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: payload.data || {},
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clientsArr => {
      const existing = clientsArr.find(c => c.url.includes(self.location.origin));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});
