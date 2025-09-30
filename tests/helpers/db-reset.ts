import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reset the shared database to initial state
 * This can be called from test hooks or teardown
 */
export function resetDatabase(): void {
  const initialDbPath = path.join(__dirname, '../../database/initial-db.json');
  const sharedDbPath = path.join(__dirname, '../../database/shared-db.json');
  
  try {
    if (fs.existsSync(initialDbPath)) {
      const initialData = fs.readFileSync(initialDbPath, 'utf-8');
      fs.writeFileSync(sharedDbPath, initialData);
      console.log('🔄 Database reset to initial state');
    } else {
      console.warn('⚠️  Initial database template not found at:', initialDbPath);
    }
  } catch (error) {
    console.error('❌ Failed to reset database:', error);
  }
}
