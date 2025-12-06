import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';

try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (!serviceAccountPath) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_PATH environment variable is not set");
    }
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

    if (!admin.apps.length) {
        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET
            });
        } else if (process.env.NODE_ENV === "development") {

            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                projectId: process.env.VITE_FIREBASE_PROJECT_ID,
                storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET
            });
        } else {
            admin.initializeApp();
        }
    }
} catch (error) {
    console.error("Firebase Admin Initialization Error:", error);
}

export const db = admin.firestore();
export const auth = admin.auth();
