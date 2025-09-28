import { FullConfig } from '@playwright/test';

/**
 * Global setup for Playwright tests
 * This runs once before all test files
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting TestMart Parallel Testing Demo');
  console.log('📊 Configuration:');
  console.log(`   Workers: ${config.workers}`);
  console.log(`   Fully Parallel: ${config.fullyParallel}`);
  console.log(`   Base URL: ${config.use?.baseURL || 'Not set'}`);
  console.log('');
  
  // Log parallel testing information
  if (config.fullyParallel && config.workers && config.workers > 1) {
    console.log('✅ Parallel execution enabled');
    console.log(`   Running tests across ${config.workers} workers`);
    console.log('   Each worker will have isolated test data');
  } else {
    console.log('⚠️  Running in serial mode');
    console.log('   Consider enabling parallel execution for better performance');
  }
  
  console.log('');
  console.log('🔧 Test Features:');
  console.log('   ✓ Worker-specific data generation');
  console.log('   ✓ Isolated browser storage');
  console.log('   ✓ Race condition prevention');
  console.log('   ✓ Unique user email generation');
  console.log('   ✓ Cart state isolation');
  console.log('');
}

export default globalSetup;