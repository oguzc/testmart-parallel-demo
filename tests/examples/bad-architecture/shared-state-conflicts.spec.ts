import { test, expect } from '@playwright/test';

/**
 * BAD ARCHITECTURE EXAMPLE: Shared State Conflicts
 * 
 * This demonstrates what happens when tests share global state.
 * These tests WILL FAIL/CONFLICT when run with multiple workers because:
 * 
 * 1. Global variables are shared across tests
 * 2. Race conditions on shared counters
 * 3. Tests modify each other's data
 * 4. Non-deterministic test results
 * 
 * Run with: npx playwright test tests/examples/bad-architecture/shared-state-conflicts.spec.ts --workers=4
 * Expected result: Unpredictable failures and race conditions
 */

// PROBLEM: Shared global state - multiple workers modify this
let sharedCartCount = 0;
let sharedOrderId = 1000;
let sharedUserCounter = 0;
const sharedUsers: { id: number; name: string }[] = [];

test.describe('BAD: Shared State Conflicts', () => {
  
  test('increment shared cart counter - race conditions', async ({ page }) => {
    console.log(`BAD: Worker incrementing shared cart counter from ${sharedCartCount}`);
    
    await page.goto('/');
    
    // Race condition: multiple workers incrementing at once
    sharedCartCount++;
    console.log(`BAD: Cart count now: ${sharedCartCount} (unreliable!)`);
    
    // Unpredictable assertion
    expect(sharedCartCount).toBeGreaterThan(0);
  });

  test('generate order ID from shared counter', async ({ page }) => {
    console.log(`BAD: Worker generating order ID from ${sharedOrderId}`);
    
    await page.goto('/');
    
    // Race condition: multiple workers incrementing
    const orderId = sharedOrderId++;
    console.log(`BAD: Generated order ID: ${orderId} (may conflict!)`);
    
    // Unpredictable results
    expect(orderId).toBeGreaterThan(999);
  });

  test('add user to shared array', async ({ page }) => {
    console.log(`BAD: Worker adding to shared users array`);
    
    await page.goto('/register');
    
    // Race condition: array mutations from multiple workers
    const userId = ++sharedUserCounter;
    sharedUsers.push({ id: userId, name: 'User' + userId });
    
    console.log(`BAD: Shared users count: ${sharedUsers.length} (unpredictable!)`);
    
    await page.getByTestId('name-input').fill('Test User');
    await page.getByTestId('email-input').fill(`user${userId}@test.com`);
    await page.getByTestId('password-input').fill('Password123!');
    await page.getByTestId('confirm-password-input').fill('Password123!');
    await page.locator('label').filter({ hasText: 'I agree to the Terms of' }).locator('.checkbox-custom').click();
    
    await page.getByTestId('register-button').click();
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('read from shared user array - unpredictable', async ({ page }) => {
    console.log(`BAD: Reading shared users array: ${sharedUsers.length} users`);
    
    await page.goto('/');
    
    // Unpredictable: depends on which tests ran first
    console.log(`BAD: User count is unpredictable: ${sharedUsers.length}`);
    
    // This assertion may pass or fail randomly
    expect(sharedUsers.length).toBeGreaterThanOrEqual(0);
  });

  test('modify shared state from multiple workers', async ({ page }) => {
    console.log(`BAD: Worker modifying shared state`);
    
    await page.goto('/');
    
    // Multiple workers all modify shared counter
    sharedCartCount += 5;
    sharedOrderId += 10;
    
    console.log(`BAD: Cart: ${sharedCartCount}, OrderID: ${sharedOrderId} (race conditions!)`);
    
    // Results are non-deterministic
    expect(sharedCartCount).toBeGreaterThan(0);
  });
});

test.describe('BAD: Test Dependencies on Shared Data', () => {
  
  test('depends on shared data from previous tests', async ({ page }) => {
    console.log(`BAD: Expecting shared data to exist`);
    
    await page.goto('/');
    
    // Unreliable: depends on other tests running first
    console.log(`BAD: Shared cart count: ${sharedCartCount} (may be 0 or any number!)`);
    console.log(`BAD: Shared users: ${sharedUsers.length} (completely unpredictable!)`);
    
    // These assertions have unpredictable results
    expect(sharedCartCount).toBeGreaterThanOrEqual(0);
  });

  test('uses hardcoded email from shared state', async ({ page }) => {
    console.log(`BAD: Trying to use hardcoded email`);
    
    await page.goto('/login');
    
    // Hardcoded email - will conflict
    await page.getByTestId('email-input').fill('fixed.user@testmart.com');
    await page.getByTestId('password-input').fill('Password123!');
    await page.getByTestId('login-button').click();
    
    // May fail if user doesn't exist
    await expect(page.getByText(/User not found|Invalid credentials/)).toBeVisible({ timeout: 5000 });
  });
});
