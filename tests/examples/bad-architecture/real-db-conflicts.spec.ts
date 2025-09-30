import { test, expect } from '@playwright/test';
import { 
  initSharedDB, 
  registerUser, 
  createOrder, 
  incrementCounter,
  reserveProduct
} from '../../fixtures/shared-db';

/**
 * BAD ARCHITECTURE EXAMPLE: Real Database Conflicts
 * 
 * This uses a SHARED DATABASE (JSON file) that all workers access.
 * These tests WILL ACTUALLY FAIL because:
 * 
 * 1. Workers compete for the same database records
 * 2. Unique constraint violations occur
 * 3. Race conditions on shared counters
 * 4. Lost update problems
 * 
 * Run with: npx playwright test tests/examples/bad-architecture/real-db-conflicts.spec.ts --workers=4
 * Expected result: REAL FAILURES from database conflicts!
 */

// Initialize shared DB once at module load (shared by ALL workers!)
initSharedDB();
console.log('🔥 BAD: SHARED database initialized - all workers will conflict!\n');

test.describe('❌ BAD: Real Database Conflicts', () => {
  
  test('register user with hardcoded email - WILL FAIL for most workers', async ({ }, testInfo) => {
    console.log(`\n🔥 Worker ${testInfo.workerIndex}: Trying to register hardcoded email`);
    
    // ❌ BAD: All workers try to register the SAME email
    const result = registerUser('conflict@testmart.com', 'Conflict User');
    
    if (!result.success) {
      console.log(`❌ Worker ${testInfo.workerIndex}: FAILED - ${result.error}`);
      // This test FAILS for workers that don't go first
      expect(result.success).toBe(true); // THIS WILL FAIL!
    } else {
      console.log(`✅ Worker ${testInfo.workerIndex}: SUCCESS - Was first to register!`);
      expect(result.success).toBe(true);
    }
  });

  test('create order with fixed order ID - PRIMARY KEY VIOLATION', async ({ }, testInfo) => {
    console.log(`\n🔥 Worker ${testInfo.workerIndex}: Creating order with fixed ID`);
    
    // ❌ BAD: All workers use the same order ID
    const result = createOrder('ORDER-12345', 'user123', 99.99);
    
    if (!result.success) {
      console.log(`❌ Worker ${testInfo.workerIndex}: FAILED - ${result.error}`);
      expect(result.success).toBe(true); // THIS WILL FAIL!
    } else {
      console.log(`✅ Worker ${testInfo.workerIndex}: SUCCESS - Created order first!`);
      expect(result.success).toBe(true);
    }
  });

  test('increment shared counter - RACE CONDITION', async ({ }, testInfo) => {
    console.log(`\n🔥 Worker ${testInfo.workerIndex}: Incrementing shared cart counter`);
    
    // ❌ BAD: Race condition on shared counter
    const beforeIncrement = incrementCounter('cartCount');
    const afterIncrement = beforeIncrement + 1;
    
    console.log(`Worker ${testInfo.workerIndex}: Counter went from ${beforeIncrement} to ${afterIncrement}`);
    
    // Sleep to make race condition more obvious
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check the actual value now (might be different due to race condition!)
    const actualValue = await import('../../fixtures/shared-db').then(m => m.getCounter('cartCount'));
    
    if (actualValue !== afterIncrement) {
      console.log(`🔥 RACE CONDITION DETECTED!`);
      console.log(`   Worker ${testInfo.workerIndex} expected: ${afterIncrement}`);
      console.log(`   Actual value: ${actualValue}`);
      console.log(`   Lost updates from other workers!`);
    }
    
    // This might fail due to race conditions
    expect(actualValue).toBeGreaterThan(0);
  });

  test('reserve product stock - INVENTORY RACE CONDITION', async ({ }, testInfo) => {
    console.log(`\n🔥 Worker ${testInfo.workerIndex}: Reserving product stock`);
    
    // ❌ BAD: All workers try to reserve from the same product
    const result = reserveProduct('PROD-001', 5);
    
    if (!result.success) {
      console.log(`❌ Worker ${testInfo.workerIndex}: FAILED - ${result.error}`);
      console.log(`   Other workers bought all the stock!`);
      // This test might FAIL due to insufficient stock
      expect(result.success).toBe(true); // THIS WILL FAIL if stock runs out!
    } else {
      console.log(`✅ Worker ${testInfo.workerIndex}: SUCCESS - Reserved 5 units`);
      expect(result.success).toBe(true);
    }
  });

  test('register multiple users with hardcoded pattern - SOME WILL FAIL', async ({ }, testInfo) => {
    console.log(`\n🔥 Worker ${testInfo.workerIndex}: Registering users with hardcoded pattern`);
    
    // ❌ BAD: Using predictable email pattern
    const results = [
      registerUser('user1@testmart.com', 'User 1'),
      registerUser('user2@testmart.com', 'User 2'),
      registerUser('user3@testmart.com', 'User 3')
    ];
    
    const failures = results.filter(r => !r.success);
    
    if (failures.length > 0) {
      console.log(`❌ Worker ${testInfo.workerIndex}: ${failures.length} registration(s) FAILED:`);
      failures.forEach((f, i) => {
        console.log(`   ${i + 1}. ${f.error}`);
      });
      
      // At least one should fail due to conflicts
      expect(failures.length).toBe(0); // THIS WILL FAIL!
    } else {
      console.log(`✅ Worker ${testInfo.workerIndex}: All registrations succeeded (was fastest!)`);
      expect(results.every(r => r.success)).toBe(true);
    }
  });
});

test.describe('❌ BAD: Lost Update Problems', () => {
  
  test('concurrent counter increments - LOST UPDATES', async ({ }, testInfo) => {
    console.log(`\n🔥 Worker ${testInfo.workerIndex}: Testing concurrent increments`);
    
    // ❌ BAD: Multiple increments without locking
    const results: number[] = [];
    
    for (let i = 0; i < 5; i++) {
      const value = incrementCounter('orderCount');
      results.push(value);
      console.log(`   Worker ${testInfo.workerIndex} increment ${i + 1}: ${value}`);
    }
    
    console.log(`🔥 Worker ${testInfo.workerIndex} got values:`, results);
    console.log(`   Expected consecutive numbers? Probably NOT due to race conditions!`);
    
    // Values might not be consecutive due to lost updates
    expect(results.length).toBe(5);
  });

  test('read-modify-write without transaction - DATA CORRUPTION', async ({ }, testInfo) => {
    console.log(`\n🔥 Worker ${testInfo.workerIndex}: Read-Modify-Write pattern (UNSAFE!)`);
    
    // ❌ BAD: Classic lost update problem
    // 1. Read current value
    const currentCounter = await import('../../fixtures/shared-db').then(m => m.getCounter('userCount'));
    console.log(`   Worker ${testInfo.workerIndex} read: ${currentCounter}`);
    
    // 2. Do some "processing" (another worker might write during this time!)
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // 3. Write back (might overwrite another worker's changes!)
    incrementCounter('userCount');
    
    console.log(`🔥 LOST UPDATE RISK: Other workers may have incremented during our processing!`);
    
    expect(currentCounter).toBeGreaterThanOrEqual(0);
  });
});

/**
 * 📊 EXPECTED FAILURES:
 * 
 * With --workers=4, you should see:
 * 
 * ❌ 3/4 workers fail "register user with hardcoded email"
 *    Error: "User with email conflict@testmart.com already exists"
 * 
 * ❌ 3/4 workers fail "create order with fixed order ID"  
 *    Error: "Order ORDER-12345 already exists"
 * 
 * ❌ Some workers fail "reserve product stock"
 *    Error: "Insufficient stock for PROD-001"
 * 
 * ❌ Most workers fail "register multiple users"
 *    Error: Multiple "already exists" errors
 * 
 * 🎯 ROOT CAUSE:
 * - Shared JSON file accessed by all workers simultaneously
 * - No database-level locking
 * - Race conditions between read and write operations
 * - Unique constraint violations
 * - Lost update problems
 * 
 * ✅ SOLUTION: See good-architecture/ tests that use worker-specific data!
 */
