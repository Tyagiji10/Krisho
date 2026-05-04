import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load from backend folder
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
// Load from root folder
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('🌍 Environment variables loaded.');
