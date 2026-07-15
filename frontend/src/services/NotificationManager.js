import { getToken, onMessage } from 'firebase/messaging';
import { messaging, isFirebaseConfigured } from '../config/firebase';
import { registerDeviceToken, deleteDeviceToken } from './DeviceTokenService';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * NotificationManager
 *
 * Eases Firebase Cloud Messaging configuration.
 * Requests browser permission, registers service worker under custom scope,
 * retrieves/saves FCM registration tokens, and handles foreground push notifications.
 */
class NotificationManager {
  constructor() {
    this.token = null;
    this.onMessageListener = null;
  }

  /**
   * Initialize and request permission for FCM push notifications.
   * Registers token with Supabase and sets up foreground receiver.
   */
  async initialize() {
    if (!isFirebaseConfigured) {
      console.warn('[NotificationManager] Firebase is not configured in environment variables.');
      return null;
    }

    if (!messaging) {
      console.warn('[NotificationManager] Firebase messaging is not initialised.');
      return null;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[NotificationManager] Push notifications not supported in this browser.');
      return null;
    }

    try {
      // 1. Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('[NotificationManager] Notification permission denied.');
        return null;
      }

      // 2. Register messaging service worker with config passed as query params
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      const appId = import.meta.env.VITE_FIREBASE_APP_ID;

      const swUrl = `/firebase-messaging-sw.js?apiKey=${apiKey}&messagingSenderId=${messagingSenderId}&projectId=${projectId}&appId=${appId}`;
      
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/firebase-cloud-messaging-push-scope',
      });

      console.log('[NotificationManager] FCM service worker registered scope:', registration.scope);

      // 3. Request registration token from FCM
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (token) {
        this.token = token;
        console.log('[NotificationManager] FCM token successfully acquired.');

        // 4. Save device token in database
        await registerDeviceToken(token);

        // 5. Setup handler for foreground messages
        this.setupForegroundListener();

        return token;
      } else {
        console.warn('[NotificationManager] No registration token returned by FCM.');
        return null;
      }
    } catch (err) {
      console.error('[NotificationManager] Failed to initialize FCM notifications:', err);
      return null;
    }
  }

  /**
   * Listener for messages received while the application is in focus (foreground).
   */
  setupForegroundListener() {
    if (!messaging) return;

    if (this.onMessageListener) {
      this.onMessageListener();
    }

    this.onMessageListener = onMessage(messaging, (payload) => {
      console.log('[NotificationManager] Foreground message received:', payload);

      if (Notification.permission === 'granted') {
        const title = payload.notification?.title || 'LifeLink AI';
        const options = {
          body: payload.notification?.body || '',
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          data: payload.data,
        };
        new Notification(title, options);
      }
    });
  }

  /**
   * Delete token from database and clear active listeners.
   */
  async cleanup() {
    if (this.token) {
      await deleteDeviceToken(this.token);
      this.token = null;
    }
    if (this.onMessageListener) {
      this.onMessageListener();
      this.onMessageListener = null;
    }
  }
}

export default new NotificationManager();
