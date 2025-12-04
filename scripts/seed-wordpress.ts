// seed-wordpress.ts
// This script seeds Firestore with data exported from WordPress (wordpress_c.json).
// It reads the JSON file, iterates over each table, and adds documents to collections.

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Initialize Firebase Admin
// process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || 'rodactiva-c1b0b';
// process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.resolve(__dirname, 'rodactiva-c1b0b-firebase-adminsdk-fbsvc-e92a3761d3.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

const app = initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore(app);
const writer = db.bulkWriter();

// Load the exported WordPress JSON file

const jsonPath = path.resolve(__dirname, 'wordpress_c.json');
const rawData = fs.readFileSync(jsonPath, { encoding: 'utf-8' });
const exportData = JSON.parse(rawData);
const argStartAfter = (process.argv.find((a) => a.startsWith('--startAfter='))?.split('=')[1]) || process.env.SEED_START_AFTER || '';
let started = argStartAfter === '';

/**
 * Helper to convert a possible MySQL timestamp string to a Firestore Timestamp.
 */
function toTimestamp(value: string): Timestamp {
    // Expect format "YYYY-MM-DD HH:MM:SS"
    try {
        const date = new Date(value.replace(' ', 'T') + 'Z');
        if (isNaN(date.getTime())) {
            // Fallback to current time or null if date is invalid
            return Timestamp.now();
        }
        return Timestamp.fromDate(date);
    } catch (e) {
        return Timestamp.now();
    }
}

async function seed() {
    console.log('🚀 Starting WordPress data seeding...');

    // The export is an array where each element may be a table definition.
    for (const entry of exportData) {
        if (entry.type !== 'table' || !entry.name || !Array.isArray(entry.data)) {
            continue; // skip non‑table entries
        }

        // Strip the prefix (e.g., "2aBPSJm_") to get a clean collection name
        // We assume the prefix ends with the first underscore.
        const rawName = entry.name;
        const parts = rawName.split('_');
        // If there's a prefix, remove it (parts[0]). Join the rest back together.
        const collectionName = parts.length > 1 ? parts.slice(1).join('_') : rawName;

        if (!started) {
            if (collectionName === argStartAfter) {
                started = true;
                continue;
            }
            continue;
        }

        // Special handling for comments: store as sub-collection of posts
        if (collectionName === 'comments') {
            console.log(`📦 Seeding ${entry.data.length} comments as sub-collections...`);
            let ops = 0;

            for (const c of entry.data) {
                const postId = c.comment_post_ID;

                // Since we stripped the prefix, the posts collection is simply 'posts'
                const commentRef = db
                    .collection('posts')
                    .doc(postId)
                    .collection('comments')
                    .doc(); // auto-ID

                const docData: any = {
                    ...c,
                    postId, // redundancy for collection-group queries
                };

                // Convert dates
                for (const key of Object.keys(docData)) {
                    const val = docData[key];
                    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(val)) {
                        docData[key] = toTimestamp(val);
                    }
                }

                writer.set(commentRef, docData);
                ops++;
                if (ops % 1000 === 0) {
                    await new Promise((r) => setTimeout(r, 50));
                }
            }
            continue;
        }

        const collectionRef = db.collection(collectionName);
        const rows = entry.data;
        console.log(`📦 Seeding collection '${collectionName}' with ${rows.length} documents...`);

        for (const row of rows) {
            // Convert any date‑like fields to Firestore Timestamp where appropriate.
            const docData: any = { ...row };
            for (const key of Object.keys(docData)) {
                const val = docData[key];
                if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(val)) {
                    // MySQL datetime format
                    docData[key] = toTimestamp(val);
                }
            }
            const docRef = collectionRef.doc();
            writer.set(docRef, docData);
            if (rows.length > 10000 && Math.random() < 0.0005) {
                await new Promise((r) => setTimeout(r, 25));
            }
        }
    }

    await writer.close();
    console.log('✅ WordPress data seeding completed!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
