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
    
    await page.goto('/register');
    await page.fill('[data-testid=email-input]', user.email);
    await page.fill('[data-testid=password-input]', user.password);
    await page.fill('[data-testid=confirm-password-input]', user.password);
    
    // Each worker uses different data = NO CONFLICTS!
    await page.click('[data-testid=register-button]');
    
    // This will pass consistently for all workers
    await expect(page.locator('[data-testid=success-message]')).toBeVisible({ timeout: 5000 });
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} successfully registered user: ${user.email}`);
  });

  test('user login - completely independent test', async ({ page }, testInfo) => {
    // ✅ SOLUTION 2: Each test creates its own test data (no dependencies!)
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} creating independent user: ${user.email}`);
    
    // First, register the user within THIS test (no external dependencies)
    await page.goto('/register');
    await page.fill('[data-testid=email-input]', user.email);
    await page.fill('[data-testid=password-input]', user.password);
    await page.fill('[data-testid=confirm-password-input]', user.password);
    await page.click('[data-testid=register-button]');
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
    
    // Then test login with the same user data
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', user.email);
    await page.fill('[data-testid=password-input]', user.password);
    await page.click('[data-testid=login-button]');
    
    // Completely independent and parallel-safe!
    await expect(page.locator('[data-testid=welcome-message]')).toBeVisible();
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} successfully logged in user: ${user.email}`);
  });

  test('add product to cart - isolated cart operations', async ({ page }, testInfo) => {
    // ✅ SOLUTION 3: Each worker operates on its own cart
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    const product = TestDataFactory.getTestProduct(1); // Safe to use same product
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} testing cart with user: ${user.email}`);
    
    // Setup: Register and login user for this specific test
    await TestDataFactory.registerAndLoginUser(page, user);
    
    await page.goto('/products');
    await page.click('[data-testid=product-1] [data-testid=add-to-cart]');
    
    // ✅ SOLUTION 4: Calculate expected values within test scope (no shared state)
    const expectedTotal = product.price;
    
    await page.goto('/cart');
    
    // Each worker has its own isolated cart - predictable results!
    const actualTotalText = await page.locator('[data-testid=cart-total]').textContent();
    const actualTotal = parseFloat(actualTotalText?.replace('$', '') || '0');
    
    expect(actualTotal).toBe(expectedTotal);
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} cart total: $${actualTotal} (reliable!)`);
  });

  test('checkout with unique order ID - no conflicts', async ({ page }, testInfo) => {
    // ✅ SOLUTION 5: Each worker generates unique order IDs
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    const order = TestDataFactory.createWorkerSpecificOrder(testInfo.workerIndex);
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} creating order: ${order.id}`);
    
    // Setup: Create user, login, add product to cart
    await TestDataFactory.setupUserWithCartItem(page, user);
    
    await page.goto('/checkout');
    
    // Each worker uses a unique order ID
    await page.fill('[data-testid=order-id-input]', order.id);
    await page.fill('[data-testid=shipping-name]', order.shippingName);
    await page.fill('[data-testid=shipping-address]', order.shippingAddress);
    await page.fill('[data-testid=payment-card]', order.paymentCard);
    
    await page.click('[data-testid=place-order]');
    
    // All workers can succeed because each uses unique order data
    await expect(page.locator('[data-testid=order-success]')).toBeVisible();
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} successfully placed order: ${order.id}`);
  });

  test('verify order - isolated verification', async ({ page }, testInfo) => {
    // ✅ SOLUTION 6: Each test creates and verifies its own data
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    const order = TestDataFactory.createWorkerSpecificOrder(testInfo.workerIndex);
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} verifying order: ${order.id}`);
    
    // Complete flow: register user, add to cart, place order
    await TestDataFactory.setupUserWithOrder(page, user, order);
    
    await page.goto('/orders');
    
    // Each worker looks for its own order (guaranteed to exist)
    const orderElement = page.locator(`[data-testid=order-${order.id}]`);
    await expect(orderElement).toBeVisible();
    
    // Verify order details are correct
    await expect(orderElement.locator('[data-testid=order-status]')).toHaveText('Confirmed');
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} successfully verified order: ${order.id}`);
  });
});

test.describe('✅ GOOD: Dynamic Data Generation', () => {
  
  test('register with unique username - no conflicts ever', async ({ page }, testInfo) => {
    // ✅ SOLUTION 7: Dynamic, time-based, worker-specific data
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} registering unique username: ${user.username}`);
    
    await page.goto('/register');
    
    // Every worker gets guaranteed unique data
    await page.fill('[data-testid=username-input]', user.username);
    await page.fill('[data-testid=email-input]', user.email);
    await page.fill('[data-testid=phone-input]', user.phone);
    await page.fill('[data-testid=password-input]', user.password);
    
    await page.click('[data-testid=register-button]');
    
    // Always succeeds because data is unique per worker
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} successfully registered: ${user.username}`);
  });

  test('update user profile - isolated user data', async ({ page }, testInfo) => {
    // ✅ SOLUTION 8: Each worker manages its own user profile
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    const updatedPhone = TestDataFactory.createWorkerSpecificPhone(testInfo.workerIndex);
    
    // Setup: Register and login user
    await TestDataFactory.registerAndLoginUser(page, user);
    
    await page.goto('/profile');
    
    // Each worker updates its own unique phone number
    await page.fill('[data-testid=phone-input]', updatedPhone);
    await page.click('[data-testid=save-profile]');
    
    // Predictable results because each worker has isolated data
    await expect(page.locator('[data-testid=profile-updated]')).toBeVisible();
    
    // Verify the update worked
    const savedPhone = await page.locator('[data-testid=phone-display]').textContent();
    expect(savedPhone).toBe(updatedPhone);
    
    console.log(`✅ GOOD: Worker ${testInfo.workerIndex} updated phone to: ${updatedPhone}`);
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