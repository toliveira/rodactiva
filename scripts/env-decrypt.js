#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
let files = [];
const keysPath = path.join(cwd, '.env.keys');
if (fs.existsSync(keysPath)) {
  const keysContent = fs.readFileSync(keysPath, 'utf8');
  const matches = [...keysContent.matchAll(/^#\s*(\.env[^\s]*)/gm)];
  files = matches.map(m => m[1]);
} else {
  files = fs.readdirSync(cwd).filter(f => f.startsWith('.env') && f !== '.env.keys' && fs.statSync(path.join(cwd, f)).isFile());
}

if (!files.length) {
  console.log('No .env files found to decrypt. Nothing to do.');
  process.exit(0);
}

for (const file of files) {
  console.log(`Decrypting ${file}...`);
  try {
    execSync(`npx dotenvx decrypt -f ${file}`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed to decrypt ${file}:`, err.message);
    process.exitCode = 1;
  }
}

console.log('Done.');
