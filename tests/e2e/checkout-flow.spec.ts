import { test, expect } from '@playwright/test';
import { TestDataFactory } from '../fixtures/TestDataFactory';
import { 
  setupUserWithCart,
  fillShippingAddress,
  completeOrder,
  proceedToCheckout,
  registerUser
} from '../helpers/test-helpers';
import { resetDatabase } from '../helpers/db-reset';

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

  // Reset database after all tests in this file complete
  test.afterAll(async () => {
    resetDatabase();
  });

  test('should complete full checkout process', async ({ page }, testInfo) => {
    const flowData = TestDataFactory.createUserFlowData(testInfo.workerIndex);
    
    await setupUserWithCart(page, flowData.user);
    await proceedToCheckout(page);
    
    // Should be on checkout page
    await expect(page).toHaveURL('/checkout');
    
    // Fill shipping and complete
    await fillShippingAddress(page, flowData.shippingAddress);
    await completeOrder(page);
    
    // Should redirect to order confirmation page
    await expect(page).toHaveURL('/order-confirmation', { timeout: 10000 });
    await expect(page.getByTestId('order-confirmation'))
      .toContainText('Your order has been placed successfully');
  });

  test('should validate required shipping fields', async ({ page }, testInfo) => {
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    
    await setupUserWithCart(page, user);
    await page.goto('/checkout');
    
    // Try to submit without filling required fields
    await page.getByTestId('complete-order').click();
    
    // Should remain on checkout page due to HTML5 validation
    await expect(page).toHaveURL('/checkout');
    
    // Verify required fields
    await expect(page.getByTestId('address-input')).toHaveAttribute('required');
    await expect(page.getByTestId('city-input')).toHaveAttribute('required');
    await expect(page.getByTestId('zip-input')).toHaveAttribute('required');
  });

  test('should show order summary correctly', async ({ page }, testInfo) => {
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    
    await setupUserWithCart(page, user);
    await page.goto('/checkout');
    
    // Verify order summary section exists
    await expect(page.getByTestId('order-summary-title'))
      .toContainText('Order Summary');
    
    // Verify checkout total is displayed
    await expect(page.getByTestId('checkout-total')).toBeVisible();
    
    // Verify order items are shown
    await expect(page.locator('[data-testid*="order-item-"]').first()).toBeVisible();
  });

  test('should handle empty cart checkout attempt', async ({ page }, testInfo) => {
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    
    // Register user but don't add items to cart
    await registerUser(page, user);
    
    // Try to go directly to checkout
    await page.goto('/checkout');
    
    // Should show empty cart message
    await expect(page.getByTestId('checkout-page'))
      .toContainText('Add some items to your cart');
  });

  test('should prevent checkout for anonymous users', async ({ page }) => {
    // Try to access checkout without logging in
    await page.goto('/checkout');
    
    // Should show signin prompt
    await expect(page.getByTestId('checkout-page'))
      .toContainText('You need to be signed in to proceed with checkout');
  });

  test('should show processing state during order submission', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const flowData = TestDataFactory.createUserFlowData(workerIndex);
    
    await setupUserWithCart(page, flowData.user);
    
    // Go to checkout and fill form
    await page.goto('/checkout');
    await page.getByTestId('address-input').fill(flowData.shippingAddress.street);
    await page.getByTestId('city-input').fill(flowData.shippingAddress.city);
    await page.getByTestId('zip-input').fill(flowData.shippingAddress.zipCode);
    
    // Click submit and immediately check for processing state
    await page.getByTestId('complete-order').click();
    
    // Should show processing text briefly
    await expect(page.getByTestId('complete-order'))
      .toContainText('Processing Order...');
  });

  test('should clear cart after successful order', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const flowData = TestDataFactory.createUserFlowData(workerIndex);
    
    await setupUserWithCart(page, flowData.user);
    
    // Complete checkout
    await page.goto('/checkout');
    await page.getByTestId('address-input').fill(flowData.shippingAddress.street);
    await page.getByTestId('city-input').fill(flowData.shippingAddress.city);
    await page.getByTestId('zip-input').fill(flowData.shippingAddress.zipCode);
    await page.getByTestId('complete-order').click();
    
    // Wait for redirect to order confirmation
    await expect(page).toHaveURL('/order-confirmation', { timeout: 10000 });
    
    // Wait a moment for cart to be cleared in backend
    await page.waitForTimeout(500);
    
    // Cart should be empty now - check for continue shopping button
    await page.goto('/cart');
    await expect(page.getByTestId('continue-shopping-button'))
      .toBeVisible();
  });

  test('should handle multiple items in checkout', async ({ page }, testInfo) => {
    const flowData = TestDataFactory.createUserFlowData(testInfo.workerIndex);
    
    // Register user
    await registerUser(page, flowData.user);
    
    // Add multiple products to cart
    await page.goto('/products');
    await page.getByTestId('product-card').first().waitFor({ timeout: 10000 });
    const products = page.getByTestId('product-card');
    const productCount = Math.min(3, await products.count());
    
    for (let i = 0; i < productCount; i++) {
      // Click product to go to detail page
      await products.nth(i).click();
      // Add to cart from detail page
      await page.getByTestId('add-to-cart-button').click();
      await page.waitForTimeout(500);
      // Go back to products for next item
      if (i < productCount - 1) {
        await page.goto('/products');
        await page.getByTestId('product-card').first().waitFor({ timeout: 10000 });
      }
    }
    
    // Proceed to checkout
    await page.goto('/checkout');
    
    // Should show multiple items in order summary
    const orderItems = page.locator('[data-testid*="order-item-"]');
    await expect(orderItems.first()).toBeVisible();
    
    // Complete checkout
    await page.getByTestId('address-input').fill(flowData.shippingAddress.street);
    await page.getByTestId('city-input').fill(flowData.shippingAddress.city);
    await page.getByTestId('zip-input').fill(flowData.shippingAddress.zipCode);
    await page.getByTestId('complete-order').click();
    
    // Should complete successfully - redirect to order confirmation
    await expect(page).toHaveURL('/order-confirmation', { timeout: 10000 });
    await expect(page.getByTestId('order-confirmation'))
      .toContainText('Your order has been placed successfully');
  });
});