// Mengimpor library Firebase v9 (compat mode) khusus untuk Service Worker
importScripts('[https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js](https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js)');
importScripts('[https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js](https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js)');
// Mengimpor Workbox untuk offline caching yang tangguh (Opsional)
importScripts('[https://storage.googleapis.com/workbox-cdn/releases/6.5.3/workbox-sw.js](https://storage.googleapis.com/workbox-cdn/releases/6.5.3/workbox-sw.js)');

// 1. Inisialisasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBCp2PBN1ASET6QjuQ3PWdC1gysQv0z_OY",
    authDomain: "onbid-2f87a.firebaseapp.com",
    projectId: "onbid-2f87a",
    storageBucket: "onbid-2f87a.firebasestorage.app",
    messagingSenderId: "223888282484",
    appId: "1:223888282484:web:2fc05ed67ca1fab39e1221"
};

firebase.initializeApp(firebaseConfig);

// 2. Inisialisasi Messaging
const messaging = firebase.messaging();

// 3. Listener saat aplikasi DITUTUP (Background)
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Menerima pesan di background ', payload);
  
  const notificationTitle = payload.notification?.title || 'Orderan Baru!';
  const notificationOptions = {
    body: payload.notification?.body || 'Segera buka aplikasi, ada tugas untukmu.',
    icon: '[https://i.ibb.co.com/qLz5Xk4t/PROJEKITA-5.png](https://i.ibb.co.com/qLz5Xk4t/PROJEKITA-5.png)', // Icon Logo
    badge: '[https://i.ibb.co.com/qLz5Xk4t/PROJEKITA-5.png](https://i.ibb.co.com/qLz5Xk4t/PROJEKITA-5.png)', // Icon kecil di status bar
    vibrate: [1000, 500, 1000, 500, 1000, 500, 2000], // Getaran keras
    requireInteraction: true, // Notifikasi TIDAK akan hilang sampai diklik
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 4. Konfigurasi Workbox (Membuat PWA Tahan Banting saat Susah Sinyal)
if (workbox) {
  // Cache gambar agar tidak perlu load ulang
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'image',
    new workbox.strategies.CacheFirst()
  );
  
  // Cache script & style
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'script' || request.destination === 'style',
    new workbox.strategies.StaleWhileRevalidate()
  );
}

// 5. Tangani Klik Notifikasi (Buka Aplikasi)
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/'); // URL awal aplikasi Anda
            }
        })
    );
});

