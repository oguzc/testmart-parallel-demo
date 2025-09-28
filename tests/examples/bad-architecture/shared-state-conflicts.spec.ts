import { test, expect } from '@playwright/test';

/**
 * ❌ BAD ARCHITECTURE EXAMPLE: Shared State Conflicts
 * 
 * This test demonstrates what NOT to do in parallel execution.
 * These tests will fail when run with multiple workers because:
 * 
 * 1. Global variables create race conditions
 * 2. Hardcoded data causes conflicts between workers  
 * 3. Tests depend on each other's state
 * 4. No isolation between test executions
 * 
 * Run with: npx playwright test shared-state-conflicts.spec.ts --workers=4
 * Expected result: Tests will fail with conflicts and race conditions
 */

// ❌ PROBLEM 1: Global shared state - multiple workers will modify this simultaneously
let globalUserEmail = 'conflict.user@testmart.com';
let globalUserId = '12345';
let globalOrderId = 'ORDER-12345';
let sharedCartTotal = 0;

// ❌ PROBLEM 2: Shared test data that creates conflicts
const SHARED_USER_DATA = {
  email: 'shared.user@testmart.com',
  username: 'shareduser',
  phone: '+1234567890'
};

test.describe('❌ BAD: Shared State Conflicts Demo', () => {
  
  test('user registration - will conflict in parallel', async ({ page }) => {
    console.log(`🔥 BAD: Worker attempting to register with email: ${globalUserEmail}`);
    
    // All workers try to register the same email = GUARANTEED CONFLICT!
    await page.goto('/register');
    await page.fill('[data-testid=email-input]', globalUserEmail);
    await page.fill('[data-testid=password-input]', 'password123');
    await page.fill('[data-testid=confirm-password-input]', 'password123');
    
    // This will work for first worker, fail for others
    await page.click('[data-testid=register-button]');
    
    // Multiple workers will see different results here!
    await expect(page.locator('[data-testid=success-message]')).toBeVisible({ timeout: 5000 });
  });

  test('user login - depends on previous test state', async ({ page }) => {
    console.log(`🔥 BAD: Worker attempting to login with email: ${globalUserEmail}`);
    
    // This assumes the registration test completed successfully
    // But in parallel execution, that's not guaranteed!
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', globalUserEmail);
    await page.fill('[data-testid=password-input]', 'password123');
    await page.click('[data-testid=login-button]');
    
    // Will fail if registration didn't happen or failed
    await expect(page.locator('[data-testid=welcome-message]')).toBeVisible();
    
    // ❌ PROBLEM 3: Modifying global state during test execution
    globalUserId = await page.locator('[data-testid=user-id]').textContent() || globalUserId;
  });

  test('add product to cart - race condition on shared data', async ({ page }) => {
    console.log(`🔥 BAD: Worker modifying shared cart total: ${sharedCartTotal}`);
    
    // Assumes user is logged in from previous test
    await page.goto('/products');
    await page.click('[data-testid=product-1] [data-testid=add-to-cart]');
    
    // ❌ PROBLEM 4: Multiple workers modifying shared variable simultaneously
    const priceText = await page.locator('[data-testid=product-1-price]').textContent();
    const price = parseFloat(priceText?.replace('$', '') || '0');
    sharedCartTotal += price; // RACE CONDITION! Multiple workers modifying this
    
    console.log(`🔥 BAD: Updated shared cart total: ${sharedCartTotal} (UNRELIABLE!)`);
    
    await page.goto('/cart');
    
    // This assertion will be unreliable because sharedCartTotal 
    // is modified by multiple workers simultaneously
    const actualTotal = await page.locator('[data-testid=cart-total]').textContent();
    console.log(`🔥 BAD: Expected: $${sharedCartTotal}, Actual: ${actualTotal}`);
  });

  test('checkout with shared order ID - guaranteed conflicts', async ({ page }) => {
    console.log(`🔥 BAD: Worker attempting checkout with shared order ID: ${globalOrderId}`);
    
    // Assumes previous tests set up the cart correctly
    await page.goto('/checkout');
    
    // ❌ PROBLEM 5: All workers try to create order with same ID
    await page.fill('[data-testid=order-id-input]', globalOrderId);
    await page.fill('[data-testid=shipping-name]', 'Test User');
    await page.fill('[data-testid=shipping-address]', '123 Test Street');
    await page.fill('[data-testid=payment-card]', '4111111111111111');
    
    await page.click('[data-testid=place-order]');
    
    // First worker succeeds, others fail with "Order ID already exists"
    await expect(page.locator('[data-testid=order-success]')).toBeVisible();
    
    // ❌ PROBLEM 6: Modifying shared state after "successful" operation
    globalOrderId = `ORDER-${Date.now()}`; // This creates more race conditions!
  });

  test('verify order in shared system - unreliable state', async ({ page }) => {
    console.log(`🔥 BAD: Worker checking order with unreliable ID: ${globalOrderId}`);
    
    // This test will see different globalOrderId values depending on 
    // which worker's checkout test ran last
    await page.goto('/orders');
    
    // The order might not exist, or might be a different order
    // depending on timing and race conditions
    const orderExists = await page.locator(`[data-testid=order-${globalOrderId}]`).isVisible();
    
    if (orderExists) {
      console.log(`🔥 BAD: Found order ${globalOrderId} - but this is just luck!`);
    } else {
      console.log(`🔥 BAD: Order ${globalOrderId} not found - race condition occurred!`);
    }
    
    // This assertion is completely unreliable in parallel execution
    expect(orderExists).toBeTruthy(); // Will randomly pass/fail!
  });
});

test.describe('❌ BAD: Hardcoded Data Conflicts', () => {
  
  test('register with fixed username - multiple workers conflict', async ({ page }) => {
    console.log(`🔥 BAD: All workers trying to register username: ${SHARED_USER_DATA.username}`);
    
    await page.goto('/register');
    
    // Every worker tries to use the same username
    await page.fill('[data-testid=username-input]', SHARED_USER_DATA.username);
    await page.fill('[data-testid=email-input]', SHARED_USER_DATA.email);
    await page.fill('[data-testid=phone-input]', SHARED_USER_DATA.phone);
    await page.fill('[data-testid=password-input]', 'password123');
    
    await page.click('[data-testid=register-button]');
    
    // Only the first worker to reach this point will succeed
    // Others will get "Username already taken" error
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
  });

  test('update user profile with same data - conflicts guaranteed', async ({ page }) => {
    // Assumes previous test registered the user successfully
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', SHARED_USER_DATA.email);
    await page.fill('[data-testid=password-input]', 'password123');
    await page.click('[data-testid=login-button]');
    
    await page.goto('/profile');
    
    // Multiple workers trying to update to the same phone number
    await page.fill('[data-testid=phone-input]', SHARED_USER_DATA.phone);
    await page.click('[data-testid=save-profile]');
    
    // Results will be unpredictable based on timing
    await expect(page.locator('[data-testid=profile-updated]')).toBeVisible();
  });
});

/**
 * 📊 EXPECTED FAILURES WHEN RUN IN PARALLEL:
 * 
 * 1. "Email already registered" errors
 * 2. "Username already taken" conflicts  
 * 3. "Order ID already exists" errors
 * 4. Race conditions on shared variables
 * 5. Tests failing due to missing setup from other tests
 * 6. Unpredictable assertion failures
 * 
 * 🎯 KEY LEARNING POINTS:
 * - Never use global variables in parallel tests
 * - Never hardcode user data that must be unique
 * - Never make tests depend on each other's state
 * - Always use worker-specific, isolated test data
 * 
 * Next: See good-architecture/worker-isolation.spec.ts for the correct approach!
 */