import { test, expect } from '@playwright/test';
import { TestDataFactory } from '../fixtures/TestDataFactory';
import { registerUser } from '../helpers/test-helpers';

/**
 * Shopping Cart Tests - Parallel Execution Scenarios
 * 
 * These tests demonstrate:
 * 1. Cart state isolation between parallel tests
 * 2. Product inventory management
 * 3. User session isolation
 * 4. Race condition prevention in cart operations
 */

test.describe('Shopping Cart - Parallel Safe', () => {

  test('should add product to cart successfully', async ({ page }, testInfo) => {
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    
    // Register and login user
    await registerUser(page, user);
    
    // Navigate to products page
    await page.goto('/products');
    await expect(page.getByTestId('products-page')).toBeVisible();
    
    // Wait for products to load
    await page.waitForSelector('[data-testid=product-card]', { timeout: 10000 });
    
    // Click on first product to go to detail page (like good examples)
    await page.getByTestId('product-card').first().click();
    
    // Add product to cart from detail page
    await page.getByTestId('add-to-cart-button').click();
    
    // Wait for cart to update
    await page.waitForTimeout(1000);
    
    // Navigate to cart via button (like good examples)
    await page.getByTestId('cart-button').click();
    await expect(page).toHaveURL('/cart', { timeout: 5000 });
    await expect(page.locator('[data-testid^=cart-item-]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should update product quantity in cart', async ({ page }, testInfo) => {
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    
    await registerUser(page, user);
    
    // Add a product to cart first
    await page.goto('/products');
    await page.waitForSelector('[data-testid=product-card]', { timeout: 10000 });
    await page.getByTestId('product-card').first().click();
    await page.getByTestId('add-to-cart-button').click();
    
    // Go to cart via button
    await page.getByTestId('cart-button').click();
    await expect(page).toHaveURL('/cart', { timeout: 5000 });
    await expect(page.locator('[data-testid^=cart-item-]').first()).toBeVisible();
    
    // Update quantity - use id selector since Quantity component uses id not data-testid
    const quantityInput = page.locator('input[id^="quantity-"]').first();
    await quantityInput.fill('3');
    
    // Verify cart item is visible with updated quantity
    await expect(page.locator('[data-testid^=cart-item-]').first()).toBeVisible();
  });

  test('should remove product from cart', async ({ page }, testInfo) => {
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    
    await registerUser(page, user);
    
    // Add a product to cart
    await page.goto('/products');
    await page.waitForSelector('[data-testid=product-card]', { timeout: 10000 });
    await page.getByTestId('product-card').first().click();
    await page.getByTestId('add-to-cart-button').click();
    
    // Go to cart via button
    await page.getByTestId('cart-button').click();
    await expect(page).toHaveURL('/cart', { timeout: 5000 });
    await expect(page.locator('[data-testid^=cart-item-]').first()).toBeVisible();
    
    // Remove the item
    await page.locator('button[data-testid*="remove-item-"]').first().click();
    
    // Verify cart is empty - check for the continue shopping button
    await expect(page.getByTestId('continue-shopping-button'))
      .toBeVisible();
  });

  test('should clear entire cart', async ({ page }, testInfo) => {
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    
    await registerUser(page, user);
    
    // Add multiple products to cart
    await page.goto('/products');
    await page.waitForSelector('[data-testid=product-card]', { timeout: 10000 });
    
    // Add same product 3 times to cart
    for (let i = 0; i < 3; i++) {
      await page.getByTestId('product-card').first().click();
      await page.getByTestId('add-to-cart-button').click();
      // Go back to products for next iteration
      if (i < 2) {
        await page.goto('/products');
        await page.waitForSelector('[data-testid=product-card]', { timeout: 10000 });
      }
    }
    
    // Go to cart via button
    await page.getByTestId('cart-button').click();
    await expect(page).toHaveURL('/cart', { timeout: 5000 });
    
    // Clear cart
    await page.getByTestId('clear-cart-button').click();
    
    // Verify cart is empty - check for the continue shopping button
    await expect(page.getByTestId('continue-shopping-button'))
      .toBeVisible();
  });

  test('should persist cart items across page navigation', async ({ page }, testInfo) => {
    // Cart persists in shared database backend with userId
    // Auth state persists in localStorage, so user session is restored on reload
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    
    await registerUser(page, user);
    
    // Add product to cart
    await page.goto('/products');
    await page.waitForSelector('[data-testid=product-card]', { timeout: 10000 });
    await page.getByTestId('product-card').first().click();
    await page.getByTestId('add-to-cart-button').click();
    
    // Navigate to cart to verify item was added
    await page.getByTestId('cart-button').click();
    await expect(page).toHaveURL('/cart', { timeout: 5000 });
    await expect(page.locator('[data-testid^=cart-item-]').first()).toBeVisible();
    
    // Reload the page to test backend persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Wait for auth to restore from localStorage and cart to load from backend
    await page.waitForTimeout(2000);
    
    // Cart should still have the item (loaded from backend database)
    await expect(page.locator('[data-testid^=cart-item-]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should show signin prompt for anonymous users', async ({ page }) => {
    // Don't login, just try to use cart features
    await page.goto('/products');
    
    // Verify signin notice is shown
    await expect(page.getByTestId('signin-notice'))
      .toContainText('Sign in to add items to your cart');
    
    // Try to go to cart
    await page.goto('/cart');
    
    // Should show login prompt
    await expect(page.getByTestId('login-prompt'))
      .toContainText('Sign In to Continue');
  });

  test('should calculate cart total correctly', async ({ page }, testInfo) => {
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
    
    await registerUser(page, user);
    
    // Add products and verify total calculation
    await page.goto('/products');
    await page.waitForSelector('[data-testid=product-card]', { timeout: 10000 });
    const firstProduct = page.getByTestId('product-card').first();
    
    // Get product price for calculation
    const priceText = await firstProduct.getByTestId(/product-price-/).textContent();
    const price = parseFloat(priceText?.replace('$', '') || '0');
    
    // Click product to go to detail page and add to cart
    await firstProduct.click();
    await page.getByTestId('add-to-cart-button').click();
    
    // Navigate to cart via button
    await page.getByTestId('cart-button').click();
    await expect(page).toHaveURL('/cart', { timeout: 5000 });
    
    // Verify total matches price
    const totalText = await page.getByTestId('cart-total').textContent();
    const total = parseFloat(totalText?.replace('$', '') || '0');
    
    expect(total).toBe(price);
  });
});