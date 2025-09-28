import { test, expect } from '@playwright/test';
import { TestDataFactory } from '../fixtures/TestDataFactory';

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
  // Helper function to register and login a user
  async function registerAndLogin(page: any, user: any) {
    await page.goto('/register');
    await page.fill('[data-testid=name-input]', user.name);
    await page.fill('[data-testid=email-input]', user.email);
    await page.fill('[data-testid=password-input]', user.password);
    await page.fill('[data-testid=confirm-password-input]', user.password);
    await page.click('[data-testid=register-button]');
    
    // Verify registration successful
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid=welcome-message]'))
      .toContainText(user.name);
  }

  test('should add product to cart successfully', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const user = TestDataFactory.createWorkerSpecificUser(workerIndex);
    
    // Register and login user
    await registerAndLogin(page, user);
    
    // Navigate to products page
    await page.goto('/products');
    await expect(page.locator('[data-testid=products-page]')).toBeVisible();
    
    // Find the first available product
    const firstProduct = page.locator('[data-testid*="product-prod-"]').first();
    await expect(firstProduct).toBeVisible();
    
    // Get product name for verification
    const productName = await firstProduct.locator('[data-testid*="product-name-"]').textContent();
    
    // Add product to cart
    await firstProduct.locator('[data-testid*="add-to-cart-"]').click();
    
    // Verify cart count increased
    await expect(page.locator('[data-testid=cart-count]')).toContainText('1');
    
    // Navigate to cart and verify product is there
    await page.goto('/cart');
    await expect(page.locator('[data-testid=cart-title]')).toContainText('Your Cart (1 items)');
    
    // Verify the product appears in cart
    if (productName) {
      await expect(page.locator(`[data-testid*="cart-item-"]:has-text("${productName}")`))
        .toBeVisible();
    }
  });

  test('should update product quantity in cart', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const user = TestDataFactory.createWorkerSpecificUser(workerIndex);
    
    await registerAndLogin(page, user);
    
    // Add a product to cart first
    await page.goto('/products');
    const firstProduct = page.locator('[data-testid*="product-prod-"]').first();
    await firstProduct.locator('[data-testid*="add-to-cart-"]').click();
    
    // Go to cart
    await page.goto('/cart');
    
    // Update quantity
    const quantityInput = page.locator('input[data-testid*="quantity-"]').first();
    await quantityInput.fill('3');
    
    // Verify cart count updated
    await expect(page.locator('[data-testid=cart-title]')).toContainText('Your Cart (3 items)');
  });

  test('should remove product from cart', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const user = TestDataFactory.createWorkerSpecificUser(workerIndex);
    
    await registerAndLogin(page, user);
    
    // Add a product to cart
    await page.goto('/products');
    const firstProduct = page.locator('[data-testid*="product-prod-"]').first();
    await firstProduct.locator('[data-testid*="add-to-cart-"]').click();
    
    // Go to cart
    await page.goto('/cart');
    await expect(page.locator('[data-testid=cart-title]')).toContainText('Your Cart (1 items)');
    
    // Remove the item
    await page.locator('button[data-testid*="remove-item-"]').first().click();
    
    // Verify cart is empty
    await expect(page.locator('[data-testid=empty-cart-message]'))
      .toContainText('Your cart is empty');
  });

  test('should clear entire cart', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const user = TestDataFactory.createWorkerSpecificUser(workerIndex);
    
    await registerAndLogin(page, user);
    
    // Add multiple products to cart
    await page.goto('/products');
    const products = page.locator('[data-testid*="product-prod-"]');
    const productCount = Math.min(3, await products.count());
    
    for (let i = 0; i < productCount; i++) {
      await products.nth(i).locator('[data-testid*="add-to-cart-"]').click();
      // Small delay to ensure cart updates
      await page.waitForTimeout(500);
    }
    
    // Go to cart
    await page.goto('/cart');
    
    // Clear cart
    await page.click('[data-testid=clear-cart-button]');
    
    // Verify cart is empty
    await expect(page.locator('[data-testid=empty-cart-message]'))
      .toContainText('Your cart is empty');
  });

  test('should persist cart items across page navigation', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const user = TestDataFactory.createWorkerSpecificUser(workerIndex);
    
    await registerAndLogin(page, user);
    
    // Add product to cart
    await page.goto('/products');
    const firstProduct = page.locator('[data-testid*="product-prod-"]').first();
    await firstProduct.locator('[data-testid*="add-to-cart-"]').click();
    
    // Navigate away and back
    await page.goto('/');
    await page.goto('/cart');
    
    // Cart should still have the item
    await expect(page.locator('[data-testid=cart-title]')).toContainText('Your Cart (1 items)');
  });

  test('should show signin prompt for anonymous users', async ({ page }) => {
    // Don't login, just try to use cart features
    await page.goto('/products');
    
    // Verify signin notice is shown
    await expect(page.locator('[data-testid=signin-notice]'))
      .toContainText('Sign in to add items to your cart');
    
    // Try to go to cart
    await page.goto('/cart');
    
    // Should show login prompt
    await expect(page.locator('[data-testid=login-prompt]'))
      .toContainText('Please sign in to view your cart');
  });

  test('should calculate cart total correctly', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const user = TestDataFactory.createWorkerSpecificUser(workerIndex);
    
    await registerAndLogin(page, user);
    
    // Add products and verify total calculation
    await page.goto('/products');
    const firstProduct = page.locator('[data-testid*="product-prod-"]').first();
    
    // Get product price for calculation
    const priceText = await firstProduct.locator('[data-testid*="product-price-"]').textContent();
    const price = parseFloat(priceText?.replace('$', '') || '0');
    
    await firstProduct.locator('[data-testid*="add-to-cart-"]').click();
    
    await page.goto('/cart');
    
    // Verify total matches price
    const totalText = await page.locator('[data-testid=cart-total]').textContent();
    const total = parseFloat(totalText?.replace('$', '') || '0');
    
    expect(total).toBe(price);
  });
});