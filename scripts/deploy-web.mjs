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

console.log(`🌍 Deploying Web to ${envMode} environment...`);
console.log(`📄 Loading config from ${envFile}`);

if (!fs.existsSync(envFile)) {
  console.error(`Error: Environment file ${envFile} not found.`);
  process.exit(1);
}

config({ path: envFile });

const {
  SERVER_HOST,
  SERVER_USER,
  SERVER_PASS,
  SERVER_PORT,
  SERVER_REMOTE_DIR
} = process.env;

if (!SERVER_HOST || !SERVER_USER || !SERVER_PASS || !SERVER_REMOTE_DIR) {
  console.error(`Missing server credentials or SERVER_REMOTE_DIR in ${envFile}`);
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
  // client.ftp.verbose = true;
  
  try {
    // 1. Build Web locally
    console.log("📦 Building Web...");
    // Run vite build with the correct mode using npx to avoid package.json script dependency
    run(`npx vite build --mode ${envMode}`, process.cwd());

    // 2. Upload via FTP
    console.log("ftp connecting...");
    await client.access({
      host: SERVER_HOST,
      port: Number(SERVER_PORT) || 21,
      user: SERVER_USER,
      password: SERVER_PASS,
      secure: false,
    });

    const localDist = path.resolve("public"); // Vite outDir is configured to 'public'
    if (!fs.existsSync(localDist)) {
      console.error(`Build output not found at ${localDist}.`);
      process.exit(1);
    }

    console.log(`📂 Uploading to ${SERVER_REMOTE_DIR}...`);
    // Upload public directory contents to SERVER_REMOTE_DIR
    await client.uploadFromDir(localDist, SERVER_REMOTE_DIR);
    
    console.log("✅ Web deploy complete");
  } catch (err) {
    console.error("Web deploy failed:", err);
    process.exit(1);
  } finally {
    client.close();
  }
}

main();
