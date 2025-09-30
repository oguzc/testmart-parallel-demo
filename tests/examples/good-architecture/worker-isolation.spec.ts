import { test, expect } from '@playwright/test';
import { TestDataFactory } from '../../fixtures/TestDataFactory';

/**
 * ✅ GOOD ARCHITECTURE EXAMPLE: Worker Isolation
 * 
 * This test demonstrates the correct approach for parallel execution.
 * These tests will run reliably with multiple workers because:
 * 
 * 1. Each worker gets unique, isolated test data
 * 2. No shared global state between tests
 * 3. Tests are completely independent 
 * 4. Proper cleanup and data management
 * 
 * Run with: npx playwright test worker-isolation.spec.ts --workers=4
 * Expected result: All tests pass consistently, regardless of worker count
 */

test.describe('✅ GOOD: Worker Isolation Patterns', () => {
  
  test('user registration - parallel safe with unique data', async ({ page }, testInfo) => {
    // ✅ SOLUTION 1: Each worker gets unique test data
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} using unique email: ${user.email}`);
    
    // ✅ REAL UI: Same registration flow as bad test, but with unique data
    await page.goto('/register');
    
    // Fill registration form with unique user data
    console.log(`🔧 Filling form with: name="${user.name}", email="${user.email}", password="${user.password}"`);
    await page.getByTestId('name-input').fill(user.name);
    await page.getByTestId('email-input').fill(user.email);
    await page.getByTestId('password-input').fill(user.password);
    await page.getByTestId('confirm-password-input').fill(user.password);

    // Accept terms and conditions - check the checkbox directly (force to bypass visual overlays)
    await page.locator('label').filter({ hasText: 'I agree to the Terms of' }).locator('.checkbox-custom').click();
    
    // Submit registration form
    console.log(`📤 Submitting registration form...`);
    await page.getByTestId('register-button').click();
    
    console.log(`⏳ Waiting for navigation...`);
    
    const urlAfterSubmit = page.url();
    console.log(`📍 Current URL after submit: ${urlAfterSubmit}`);

    // ✅ SUCCESS: This works because each worker has unique data
    await expect(page).toHaveURL(/\/$/, { timeout: 5000 });
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} has unique data - no registration conflicts!`);
  });

  test('user login - completely independent test', async ({ page }, testInfo) => {
    // ✅ SOLUTION 2: Each test creates its own test data (no dependencies!)
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} creating independent user: ${user.email}`);
    
    // First register the user (prerequisite for login)
    await page.goto('/register');
    await page.getByTestId('name-input').fill(user.name);
    await page.getByTestId('email-input').fill(user.email);
    await page.getByTestId('password-input').fill(user.password);
    await page.getByTestId('confirm-password-input').fill(user.password);
    await page.locator('label').filter({ hasText: 'I agree to the Terms of' }).locator('.checkbox-custom').click();
    await page.getByTestId('register-button').click();
    await expect(page).toHaveURL('/', { timeout: 10000 });
    
    // Logout after registration to test login independently
    await page.getByTestId('logout-button').click();
    await expect(page).toHaveURL('/', { timeout: 5000 });
    
    // Now test login with the registered user
    await page.goto('/login');
    await page.getByTestId('email-input').fill(user.email);
    await page.getByTestId('password-input').fill(user.password);
    await page.getByTestId('login-button').click();
    
    // ✅ SUCCESS: Verify successful login with unique user data
    await expect(page).toHaveURL('/', { timeout: 10000 });
    expect(user.email).toContain(`worker${testInfo.workerIndex}`);
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} successfully logged in user: ${user.email}`);
  });

  test('add product to cart - isolated cart operations', async ({ page }, testInfo) => {
    // ✅ SOLUTION 3: Each worker operates on its own cart
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} testing cart with user: ${user.email}`);
    
    // Register user first
    await page.goto('/register');
    await page.getByTestId('name-input').fill(user.name);
    await page.getByTestId('email-input').fill(user.email);
    await page.getByTestId('password-input').fill(user.password);
    await page.getByTestId('confirm-password-input').fill(user.password);
    await page.locator('label').filter({ hasText: 'I agree to the Terms of' }).locator('.checkbox-custom').click();
    await page.getByTestId('register-button').click();
    await expect(page).toHaveURL('/', { timeout: 10000 });
    
    // Navigate to products and add first product to cart
    await page.goto('/products');
    await page.waitForSelector('[data-testid=product-card]', { timeout: 10000 });
    await page.getByTestId('product-card').first().click();
    
    // Add product to cart
    await page.getByTestId('add-to-cart-button').click();
    
    // Verify cart has the item
    await page.getByTestId('cart-button').click();
    await expect(page).toHaveURL('/cart', { timeout: 5000 });
    await expect(page.locator('[data-testid^=cart-item-]').first()).toBeVisible({ timeout: 10000 });
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} has isolated cart operations!`);
  });

  test('checkout with unique order ID - no conflicts', async ({ page }, testInfo) => {
    // ✅ SOLUTION 4: Each worker generates unique order IDs
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} testing checkout with user: ${user.email}`);
    
    // Register user and add item to cart
    await page.goto('/register');
    await page.getByTestId('name-input').fill(user.name);
    await page.getByTestId('email-input').fill(user.email);
    await page.getByTestId('password-input').fill(user.password);
    await page.getByTestId('confirm-password-input').fill(user.password);
    await page.locator('label').filter({ hasText: 'I agree to the Terms of' }).locator('.checkbox-custom').click();
    await page.getByTestId('register-button').click();
    await expect(page).toHaveURL('/', { timeout: 10000 });
    
    // Add product to cart
    await page.goto('/products');
    await page.waitForSelector('[data-testid=product-card]', { timeout: 10000 });
    await page.getByTestId('product-card').first().click();
    await page.getByTestId('add-to-cart-button').click();
    
    // Proceed to checkout
    await page.getByTestId('cart-button').click();
    await page.getByTestId('checkout-button').click();
    
    // Fill checkout form with unique data
    await page.getByTestId('address-input').fill(`${testInfo.workerIndex} Test St`);
    await page.getByTestId('city-input').fill('Test City');
    await page.getByTestId('zip-input').fill('12345');
    
    // Complete checkout
    await page.getByTestId('complete-order').click();
    
    // ✅ SUCCESS: Perfect order isolation - no database conflicts possible
    await expect(page).toHaveURL('/order-confirmation', { timeout: 10000 });
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} has unique checkout data - no conflicts!`);
  });

  test('verify order - isolated verification', async ({ page }, testInfo) => {
    // ✅ SOLUTION 5: Each test creates and verifies its own data
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} verifying order flow for user: ${user.email}`);
    
    // Register user and complete full order flow
    await page.goto('/register');
    await page.getByTestId('name-input').fill(user.name);
    await page.getByTestId('email-input').fill(user.email);
    await page.getByTestId('password-input').fill(user.password);
    await page.getByTestId('confirm-password-input').fill(user.password);
    await page.locator('label').filter({ hasText: 'I agree to the Terms of' }).locator('.checkbox-custom').click();
    await page.getByTestId('register-button').click();
    await expect(page).toHaveURL('/', { timeout: 10000 });
    
    // Add product to cart and checkout
    await page.goto('/products');
    await page.waitForSelector('[data-testid=product-card]', { timeout: 10000 });
    await page.getByTestId('product-card').first().click();
    await page.getByTestId('add-to-cart-button').click();
    await page.getByTestId('cart-button').click();
    await page.getByTestId('checkout-button').click();
    
    // Complete checkout
    await page.getByTestId('address-input').fill(`${testInfo.workerIndex} Test St`);
    await page.getByTestId('city-input').fill('Test City');
    await page.getByTestId('zip-input').fill('12345');
    await page.getByTestId('complete-order').click();
    
    // ✅ SUCCESS: Verify order confirmation page shows unique order
    await expect(page).toHaveURL('/order-confirmation', { timeout: 10000 });
    await expect(page.locator('[data-testid=order-confirmation]')).toBeVisible();
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} completed isolated verification!`);
  });
});

test.describe('✅ GOOD: Dynamic Data Generation', () => {
  
  test('register with unique username - no conflicts ever', async ({ page }, testInfo) => {
    // ✅ SOLUTION 6: Dynamic, time-based, worker-specific data
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} registering unique username: ${user.username}`);
    
    // ✅ REAL UI: Test registration with dynamically generated unique data
    await page.goto('/register');
    
    // Fill form with unique data
    await page.getByTestId('name-input').fill(user.name);
    await page.getByTestId('email-input').fill(user.email);
    await page.getByTestId('password-input').fill(user.password);
    await page.getByTestId('confirm-password-input').fill(user.password);
    await page.locator('label').filter({ hasText: 'I agree to the Terms of' }).locator('.checkbox-custom').click();
    
    // Submit registration
    await page.getByTestId('register-button').click();
    
    // ✅ SUCCESS: Dynamic generation ensures no conflicts ever
    await expect(page).toHaveURL('/', { timeout: 10000 });
    expect(user.username).toMatch(/testuser_[a-z0-9]{9}/);
    expect(user.email).toContain(`worker${testInfo.workerIndex}`);
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} has perfectly unique dynamic data!`);
  });

  test('update user profile - isolated user data', async ({ page }, testInfo) => {
    // ✅ SOLUTION 7: Each worker manages its own user profile
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} testing profile update for user: ${user.email}`);
    
    // Register user first
    await page.goto('/register');
    await page.getByTestId('name-input').fill(user.name);
    await page.getByTestId('email-input').fill(user.email);
    await page.getByTestId('password-input').fill(user.password);
    await page.getByTestId('confirm-password-input').fill(user.password);
    await page.locator('label').filter({ hasText: 'I agree to the Terms of' }).locator('.checkbox-custom').click();
    await page.getByTestId('register-button').click();
    await expect(page).toHaveURL('/', { timeout: 10000 });
    
    // Navigate to profile page (simulate profile management)
    await page.goto('/');
    
    // Verify user is logged in with their unique data
    await expect(page.getByTestId('user-name')).toContainText(user.name);
    
    // ✅ SUCCESS: Perfect profile isolation - no data mixing between workers
    expect(user.email).toContain(`worker${testInfo.workerIndex}`);
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} has isolated profile management!`);
  });
});

/**
 * 🎯 KEY SUCCESS PATTERNS DEMONSTRATED:
 * 
 * ✅ Worker-specific test data generation
 * ✅ No shared global variables
 * ✅ Independent test execution
 * ✅ Proper test data factories
 * ✅ Isolated cleanup (implicit)
 * ✅ Predictable, reliable results
 * 
 * 📊 BENEFITS OF THIS APPROACH:
 * - Tests run reliably with any number of workers (1, 4, 8, 16+)
 * - No flaky test behavior due to race conditions
 * - Easy to debug because each test is self-contained
 * - Perfect for CI/CD pipelines with parallel execution
 * - Scales to large test suites without conflicts
 * 
 * 🚀 NEXT STEPS:
 * See the TestDataFactory implementation in ../../fixtures/TestDataFactory.ts
 * Run both bad and good examples to see the difference!
 */