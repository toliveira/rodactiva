import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Analytics (only if supported)
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported: boolean) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Initialize App Check
if (import.meta.env.VITE_FIREBASE_RECAPTCHA_KEY) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_FIREBASE_RECAPTCHA_KEY),
    isTokenAutoRefreshEnabled: true,
  });
}

// Connect to emulators in development
if (import.meta.env.DEV) {
  if (import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true') {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectStorageEmulator(storage, 'localhost', 9199);
      connectAuthEmulator(auth, 'http://localhost:9099');
    } catch (error) {
      // Emulators might already be connected
      console.debug('Firebase emulators already initialized or not available');
    }
  }
}

/**
 * Log a custom event to Firebase Analytics
 */
export function logCustomEvent(eventName: string, eventParams?: Record<string, any>) {
  try {
    if (analytics) {
      const { logEvent } = require('firebase/analytics');
      logEvent(analytics, eventName, eventParams);
    }
  } catch (error) {
    console.warn('Failed to log event:', error);
  }
}

/**
 * Track page view
 */
export function trackPageView(pageName: string) {
  logCustomEvent('page_view', {
    page_title: pageName,
    page_location: window.location.href,
  });
}

/**
 * Track event registration
 */
export function trackEventRegistration(eventId: string, eventName: string) {
  logCustomEvent('event_registration', {
    event_id: eventId,
    event_name: eventName,
  });
}

/**
 * Track gallery view
 */
export function trackGalleryView(itemId: string, itemType: string) {
  logCustomEvent('gallery_view', {
    item_id: itemId,
    item_type: itemType,
  });
}

/**
 * Track route download
 */
export function trackRouteDownload(routeId: string, routeName: string) {
  logCustomEvent('route_download', {
    route_id: routeId,
    route_name: routeName,
  });
}

export default app;
