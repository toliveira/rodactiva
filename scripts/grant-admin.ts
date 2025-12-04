// scripts/grant-admin.ts
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.resolve(__dirname, "./rodactiva-c1b0b-firebase-adminsdk-fbsvc-e92a3761d3.json");
if (!fs.existsSync(serviceAccountPath)) {
    console.error("❌ Service account key not found at:", serviceAccountPath);
    console.error("Please download it from Firebase Console -> Project Settings -> Service Accounts");
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

initializeApp({
    credential: cert(serviceAccount),
});

const auth = getAuth();

async function grant(email: string) {
    try {
        const user = await auth.getUserByEmail(email);
        await auth.setCustomUserClaims(user.uid, { admin: true });
        console.log(`✅ Successfully granted admin rights to: ${email}`);
        console.log(`   UID: ${user.uid}`);
        process.exit(0);
    } catch (error) {
        console.error(`❌ Error granting admin rights:`, error);
        process.exit(1);
    }
}

const email = process.argv[2];
if (!email) {
    console.error("Usage: npx tsx ./scripts/grant-admin.ts <email>");
    process.exit(1);
}

grant(email);
