import { initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider, getToken, type AppCheck } from 'firebase/app-check';
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
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
});

// Initialize Storage
export const storage = getStorage(app);

// Initialize Auth
export const auth = getAuth(app);

import { onIdTokenChanged } from 'firebase/auth';

// Expose custom claims on the auth user object
onIdTokenChanged(auth, async (user) => {
  if (user) {
    const token = await user.getIdTokenResult();
    // attach claims for easy access in UI
    (user as any).token = token.claims;
  }
});

// Initialize Analytics (only if supported)
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported: boolean) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Check if we're using emulators
const useEmulator = import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true';

let appCheck: AppCheck | undefined;

// Initialize App Check (only if NOT using emulator and key is provided)
if (!useEmulator && import.meta.env.VITE_FIREBASE_RECAPTCHA_KEY) {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_FIREBASE_RECAPTCHA_KEY),
    isTokenAutoRefreshEnabled: true,
  });
}

// Connect to emulators in development
if (import.meta.env.DEV && useEmulator) {
  try {
    const firestorePort = import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || 8080;
    const authPort = import.meta.env.VITE_AUTH_EMULATOR_PORT || 9099;
    const storagePort = import.meta.env.VITE_STORAGE_EMULATOR_PORT || 9199;

    connectFirestoreEmulator(db, 'localhost', Number(firestorePort));
    connectAuthEmulator(auth, `http://localhost:${authPort}`);
    connectStorageEmulator(storage, 'localhost', Number(storagePort));

    console.log('✅ Firebase emulators connected');
  } catch (error) {
    // Emulators might already be connected
    console.debug('Firebase emulators already initialized or not available');
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

export async function getAppCheckToken(): Promise<string | null> {
  try {
    if (!appCheck) return null;
    const { token } = await getToken(appCheck, false);
    return token || null;
  } catch (e) {
    return null;
  }
}
