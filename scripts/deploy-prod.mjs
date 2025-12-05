import ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import { config } from "@dotenvx/dotenvx";

config({ path: ".env.production" });

const {
  SERVER_HOST,
  SERVER_USER,
  SERVER_PASS,
  SERVER_PORT,
  SERVER_REMOTE_DIR
} = process.env;

if (!SERVER_HOST || !SERVER_USER || !SERVER_PASS) {
  console.error("Missing server credentials. Set SERVER_HOST, SERVER_USER, SERVER_PASS in .env.production");
  process.exit(1);
}

async function uploadDir(client, localDir, remoteDir) {
  await client.ensureDir(remoteDir);
  const entries = fs.readdirSync(localDir, { withFileTypes: true });
  for (const entry of entries) {
    const localPath = path.join(localDir, entry.name);
    const remotePath = `${remoteDir}/${entry.name}`;
    if (entry.isDirectory()) {
      await uploadDir(client, localPath, remotePath);
      await client.cd("..");
    } else {
      await client.uploadFrom(localPath, remotePath);
      console.log(`Uploaded ${localPath} -> ${remotePath}`);
    }
  }
}

async function main() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access({
      host: SERVER_HOST,
      port: Number(SERVER_PORT),
      user: SERVER_USER,
      password: SERVER_PASS,
      secure: false,
    });

    const localDist = path.resolve("public");
    if (!fs.existsSync(localDist)) {
      console.error(`Build output not found at ${localDist}. Run: npm run build`);
      process.exit(1);
    }

    await uploadDir(client, localDist, SERVER_REMOTE_DIR);
    console.log("✅ FTP deploy complete");
  } catch (err) {
    console.error("FTP deploy failed:", err);
    process.exit(1);
  } finally {
    client.close();
  }
}

main();