import path from 'path';
import fs from 'fs';
import { config } from '@dotenvx/dotenvx';

const envPath = path.resolve(__dirname, '../../.env');
const envDevPath = path.resolve(__dirname, '../../.env.development');

// Load environment variables before anything else
config({ 
  path: [
    envPath,
    envDevPath
  ],
  override: true 
});

// Set default NODE_ENV if not present
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}
