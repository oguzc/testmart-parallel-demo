import { test, expect } from '@playwright/test';
import { TestDataFactory } from '../fixtures/TestDataFactory';

/**
 * Checkout Process Tests - Parallel Execution Scenarios
 * 
 * These tests demonstrate:
 * 1. Complete user flow isolation
 * 2. Order processing in parallel
 * 3. Form validation across workers
 * 4. Success state handling
 */

test.describe('Checkout Process - Parallel Safe', () => {
  // Helper function to set up user with items in cart
  async function setupUserWithCart(page: any, user: any) {
    // Register user
    await page.goto('/register');
    await page.fill('[data-testid=name-input]', user.name);
    await page.fill('[data-testid=email-input]', user.email);
    await page.fill('[data-testid=password-input]', user.password);
    await page.fill('[data-testid=confirm-password-input]', user.password);
    await page.click('[data-testid=register-button]');
    
    // Add product to cart
    await page.goto('/products');
    const firstProduct = page.locator('[data-testid*="product-prod-"]').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.locator('[data-testid*="add-to-cart-"]').click();
    
    // Verify item in cart
    await expect(page.locator('[data-testid=cart-count]')).toContainText('1');
  }

  test('should complete full checkout process', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const flowData = TestDataFactory.createUserFlowData(workerIndex);
    
    await setupUserWithCart(page, flowData.user);
    
    // Navigate to cart and proceed to checkout
    await page.goto('/cart');
    await page.click('[data-testid=checkout-button]');
    
    // Should be on checkout page
    await expect(page).toHaveURL('/checkout');
    await expect(page.locator('[data-testid=checkout-title]')).toContainText('Checkout');
    
    // Fill shipping information
    await page.fill('[data-testid=address-input]', flowData.shippingAddress.street);
    await page.fill('[data-testid=city-input]', flowData.shippingAddress.city);
    await page.fill('[data-testid=zip-input]', flowData.shippingAddress.zipCode);
    
    // Complete order
    await page.click('[data-testid=complete-order]');
    
    // Should redirect to home with success message
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid=success-message]'))
      .toContainText('Order completed successfully');
  });

  test('should validate required shipping fields', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const user = TestDataFactory.createWorkerSpecificUser(workerIndex);
    
    await setupUserWithCart(page, user);
    
    // Go to checkout
    await page.goto('/checkout');
    
    // Try to submit without filling required fields
    await page.click('[data-testid=complete-order]');
    
    // Should remain on checkout page due to HTML5 validation
    await expect(page).toHaveURL('/checkout');
    
    // Verify required fields
    await expect(page.locator('[data-testid=address-input]')).toHaveAttribute('required');
    await expect(page.locator('[data-testid=city-input]')).toHaveAttribute('required');
    await expect(page.locator('[data-testid=zip-input]')).toHaveAttribute('required');
  });

  test('should show order summary correctly', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const user = TestDataFactory.createWorkerSpecificUser(workerIndex);
    
    await setupUserWithCart(page, user);
    
    // Navigate to checkout
    await page.goto('/checkout');
    
    // Verify order summary section exists
    await expect(page.locator('[data-testid=order-summary-title]'))
      .toContainText('Order Summary');
    
    // Verify checkout total is displayed
    await expect(page.locator('[data-testid=checkout-total]')).toBeVisible();
    
    // Verify order items are shown
    await expect(page.locator('[data-testid*="order-item-"]').first()).toBeVisible();
  });

  test('should handle empty cart checkout attempt', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const user = TestDataFactory.createWorkerSpecificUser(workerIndex);
    
    // Register user but don't add items to cart
    await page.goto('/register');
    await page.fill('[data-testid=name-input]', user.name);
    await page.fill('[data-testid=email-input]', user.email);
    await page.fill('[data-testid=password-input]', user.password);
    await page.fill('[data-testid=confirm-password-input]', user.password);
    await page.click('[data-testid=register-button]');
    
    // Try to go directly to checkout
    await page.goto('/checkout');
    
    // Should show empty cart message
    await expect(page.locator('[data-testid=checkout-page]'))
      .toContainText('Your cart is empty');
  });

  test('should prevent checkout for anonymous users', async ({ page }) => {
    // Try to access checkout without logging in
    await page.goto('/checkout');
    
    // Should show signin prompt
    await expect(page.locator('[data-testid=checkout-page]'))
      .toContainText('Please sign in to complete your order');
  });

  test('should show processing state during order submission', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const flowData = TestDataFactory.createUserFlowData(workerIndex);
    
    await setupUserWithCart(page, flowData.user);
    
    // Go to checkout and fill form
    await page.goto('/checkout');
    await page.fill('[data-testid=address-input]', flowData.shippingAddress.street);
    await page.fill('[data-testid=city-input]', flowData.shippingAddress.city);
    await page.fill('[data-testid=zip-input]', flowData.shippingAddress.zipCode);
    
    // Click submit and immediately check for processing state
    await page.click('[data-testid=complete-order]');
    
    // Should show processing text briefly
    await expect(page.locator('[data-testid=complete-order]'))
      .toContainText('Processing Order...');
  });

  test('should clear cart after successful order', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const flowData = TestDataFactory.createUserFlowData(workerIndex);
    
    await setupUserWithCart(page, flowData.user);
    
    // Complete checkout
    await page.goto('/checkout');
    await page.fill('[data-testid=address-input]', flowData.shippingAddress.street);
    await page.fill('[data-testid=city-input]', flowData.shippingAddress.city);
    await page.fill('[data-testid=zip-input]', flowData.shippingAddress.zipCode);
    await page.click('[data-testid=complete-order]');
    
    // Wait for redirect to home
    await expect(page).toHaveURL('/');
    
    // Cart should be empty now
    await page.goto('/cart');
    await expect(page.locator('[data-testid=empty-cart-message]'))
      .toContainText('Your cart is empty');
  });

  test('should handle multiple items in checkout', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const flowData = TestDataFactory.createUserFlowData(workerIndex);
    
    // Register user
    await page.goto('/register');
    await page.fill('[data-testid=name-input]', flowData.user.name);
    await page.fill('[data-testid=email-input]', flowData.user.email);
    await page.fill('[data-testid=password-input]', flowData.user.password);
    await page.fill('[data-testid=confirm-password-input]', flowData.user.password);
    await page.click('[data-testid=register-button]');
    
    // Add multiple products to cart
    await page.goto('/products');
    const products = page.locator('[data-testid*="product-prod-"]');
    const productCount = Math.min(3, await products.count());
    
    for (let i = 0; i < productCount; i++) {
      await products.nth(i).locator('[data-testid*="add-to-cart-"]').click();
      await page.waitForTimeout(300); // Small delay for cart updates
    }
    
    // Proceed to checkout
    await page.goto('/checkout');
    
    // Should show multiple items in order summary
    const orderItems = page.locator('[data-testid*="order-item-"]');
    await expect(orderItems.first()).toBeVisible();
    
    // Complete checkout
    await page.fill('[data-testid=address-input]', flowData.shippingAddress.street);
    await page.fill('[data-testid=city-input]', flowData.shippingAddress.city);
    await page.fill('[data-testid=zip-input]', flowData.shippingAddress.zipCode);
    await page.click('[data-testid=complete-order]');
    
    // Should complete successfully
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid=success-message]'))
      .toContainText('Order completed successfully');
  });
});