import ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import { config } from "@dotenvx/dotenvx";
import { execSync } from "child_process";

// Helper to normalize environment names
function normalizeEnv(env) {
  const map = {
    dev: "development",
    stg: "staging",
    prd: "production",
    prod: "production",
    development: "development",
    staging: "staging",
    production: "production"
  };
  return map[env] || "production";
}

// Get environment from command line args
const args = process.argv.slice(2);
const inputEnv = args[0] || "production";
const envMode = normalizeEnv(inputEnv);
const envFile = `.env.${envMode}`;

console.log(`🌍 Deploying to ${envMode} environment...`);
console.log(`📄 Loading config from ${envFile}`);

if (!fs.existsSync(envFile)) {
  console.error(`Error: Environment file ${envFile} not found.`);
  process.exit(1);
}

// Load environment variables
config({ path: envFile });

const {
  SERVER_HOST,
  SERVER_USER,
  SERVER_PASS,
  SERVER_PORT,
  SERVER_REMOTE_API_DIR
} = process.env;

if (!SERVER_HOST || !SERVER_USER || !SERVER_PASS || !SERVER_REMOTE_API_DIR) {
  console.error(`Missing server credentials or SERVER_REMOTE_API_DIR in ${envFile}`);
  process.exit(1);
}

// Helper to run shell commands
function run(cmd, cwd) {
  console.log(`> ${cmd}`);
  try {
    execSync(cmd, { stdio: "inherit", cwd });
  } catch (error) {
    console.error(`Command failed: ${cmd}`);
    throw error;
  }
}

async function main() {
  const client = new ftp.Client();
  // client.ftp.verbose = true; // Enable for debugging

  try {
    console.log("🚀 Starting API deployment...");

    const apiDir = path.resolve("api");

    // 2. Upload files via FTP
    console.log("ftp connecting...");
    await client.access({
      host: SERVER_HOST,
      port: Number(SERVER_PORT) || 21,
      user: SERVER_USER,
      password: SERVER_PASS,
      secure: false,
    });

    console.log(`📂 Uploading to ${SERVER_REMOTE_API_DIR}...`);
    await client.ensureDir(SERVER_REMOTE_API_DIR);

    // Upload dist directory
    console.log("   Uploading dist...");
    await client.ensureDir(`${SERVER_REMOTE_API_DIR}/dist`);
    await client.clearWorkingDir(); // Optional: clear remote dist? No, basic-ftp doesn't have clearDir easily.
    // We overwrite files.
    await client.uploadFromDir(path.join(apiDir, "dist"), `${SERVER_REMOTE_API_DIR}/dist`);

    // Upload package.json and package-lock.json
    console.log("   Uploading package files...");
    await client.uploadFrom(path.join(apiDir, "package.json"), `${SERVER_REMOTE_API_DIR}/package.json`);
    await client.uploadFrom(path.join(apiDir, "package-lock.json"), `${SERVER_REMOTE_API_DIR}/package-lock.json`);

    // Upload correct .env file as .env
    console.log(`   Uploading ${envFile} as .env...`);
    await client.uploadFrom(path.resolve(envFile), `${SERVER_REMOTE_API_DIR}/.env`);

    console.log("✅ API Deployment finished successfully!");

  } catch (err) {
    console.error("❌ Deploy failed:", err);
    process.exit(1);
  } finally {
    client.close();
  }
}

main();
