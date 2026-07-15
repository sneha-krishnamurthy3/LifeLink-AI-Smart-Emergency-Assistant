// ============================================================
// Firebase Cloud Messaging Background Service Worker
// ============================================================

// Import the Firebase App and Messaging compatibility libraries
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Check URL parameters for initialisation variables
// Since service worker registration can append query parameters,
// we can read them dynamically instead of hardcoding them!
const urlParams = new URL(location).searchParams;
const messagingSenderId = urlParams.get('messagingSenderId');
const projectId = urlParams.get('projectId');
const apiKey = urlParams.get('apiKey');
const appId = urlParams.get('appId');

if (apiKey && messagingSenderId && projectId) {
  firebase.initializeApp({
    apiKey: apiKey,
    messagingSenderId: messagingSenderId,
    projectId: projectId,
    appId: appId || '',
  });

  const messaging = firebase.messaging();

  // Background message handler
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'LifeLink AI Notification';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: payload.data,
      actions: [
        { action: 'open', title: 'Open LifeLink AI' }
      ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} else {
  console.warn(
    '[firebase-messaging-sw.js] Initialisation parameters missing in URL query. ' +
    'FCM service worker running in inactive standby mode.'
  );
}

// Handle notification click action
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Custom click action or payload data routing
  const targetUrl = event.notification.data?.click_action || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing tab or open new window
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(location.origin) && 'focus' in client) {
          return client.focus().then((focusedClient) => {
            if ('navigate' in focusedClient) {
              return focusedClient.navigate(targetUrl);
            }
          });
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
