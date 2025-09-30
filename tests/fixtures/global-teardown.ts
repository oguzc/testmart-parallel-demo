import type { FullConfig } from '@playwright/test';
import { resetDatabase } from '../helpers/db-reset';

/**
 * Global teardown for Playwright tests
 * This runs once after all test files complete
 * 
 * Resets the shared database to initial state by:
 * 1. Copying initial-db.json to shared-db.json
 * 2. Cleaning up test users (keeping only demo user)
 */
async function globalTeardown(_config: FullConfig) {
  console.log('');
  console.log('🧹 Global teardown: Cleaning up after test run...');
  resetDatabase();
  console.log('   • Products restored to original stock levels');
  console.log('   • Test users cleared');
  console.log('   • Cart items cleared');
  console.log('   • Orders cleared');
  console.log('');
  console.log('✨ Test run complete!');
}

export default globalTeardown;
