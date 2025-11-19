import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

export const isFirebaseConfigured = Boolean(apiKey && authDomain && projectId && appId);

export const getFirebaseApp = (): FirebaseApp => {
  if (!isFirebaseConfigured) {
    throw new Error(
      '[Firebase] Missing config. Please set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID'
    );
  }

  if (!getApps().length) {
    app = initializeApp({
      apiKey,
      authDomain,
      projectId,
      appId,
    });
  }

  if (!app) {
    // Fallback safety – should not happen
    app = initializeApp({
      apiKey,
      authDomain,
      projectId,
      appId,
    });
  }

  return app;
};

export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    const appInstance = getFirebaseApp();
    auth = getAuth(appInstance);
  }
  return auth;
};

