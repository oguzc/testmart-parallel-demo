import { test as base, expect } from '@playwright/test';
import { TestDataFactory } from './TestDataFactory';
import type { TestUser, TestProduct } from './TestDataFactory';

// Define the types of our fixtures
type TestFixtures = {
  testUser: TestUser;
  testProduct: TestProduct;
  workerIndex: number;
  isolatedStorage: void;
};

/**
 * Extended Playwright test with custom fixtures for parallel testing
 */
export const test = base.extend<TestFixtures>({
  // Get the worker index for data isolation
  workerIndex: async ({}, use, testInfo) => {
    await use(testInfo.workerIndex);
  },

  // Ensure isolated storage per worker
  isolatedStorage: [async ({ page, workerIndex }, use) => {
    // Clear any existing storage
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    await use();
    
    // Cleanup after test
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }, { auto: true }],

  // Generate a unique user for each test
  testUser: async ({ workerIndex }, use) => {
    const user = TestDataFactory.createWorkerSpecificUser(workerIndex);
    await use(user);
  },

  // Generate a unique product for each test
  testProduct: async ({ workerIndex }, use) => {
    const product = TestDataFactory.createWorkerSpecificProduct(workerIndex);
    await use(product);
  },
});

// Re-export expect for convenience
export { expect };

/**
 * Helper functions for common test operations
 */
export const TestHelpers = {
  /**
   * Register a new user through the UI
   */
  async registerUser(page: any, user: TestUser) {
    await page.goto('/register');
    await page.fill('[data-testid=name-input]', user.name);
    await page.fill('[data-testid=email-input]', user.email);
    await page.fill('[data-testid=password-input]', user.password);
    await page.fill('[data-testid=confirm-password-input]', user.password);
    await page.click('[data-testid=register-button]');
    
    // Wait for successful registration
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid=welcome-message]')).toContainText(user.name);
  },

  /**
   * Login an existing user through the UI
   */
  async loginUser(page: any, user: TestUser) {
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', user.email);
    await page.fill('[data-testid=password-input]', user.password);
    await page.click('[data-testid=login-button]');
    
    // Wait for successful login
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid=welcome-message]')).toContainText(user.name);
  },

  /**
   * Add a product to cart and verify
   */
  async addProductToCart(page: any, productName: string) {
    await page.goto('/products');
    
    // Find the product and add to cart
    const productCard = page.locator(`[data-testid*="product-"]:has-text("${productName}")`).first();
    await expect(productCard).toBeVisible();
    await productCard.locator('[data-testid*="add-to-cart-"]').click();
    
    // Verify cart count increased
    await expect(page.locator('[data-testid=cart-count]')).toBeVisible();
  },

  /**
   * Complete the checkout process
   */
  async completeCheckout(page: any, shippingAddress: any) {
    await page.goto('/cart');
    await page.click('[data-testid=checkout-button]');
    
    // Fill shipping information
    await page.fill('[data-testid=address-input]', shippingAddress.street);
    await page.fill('[data-testid=city-input]', shippingAddress.city);
    await page.fill('[data-testid=zip-input]', shippingAddress.zipCode);
    
    // Complete order
    await page.click('[data-testid=complete-order]');
    
    // Verify success
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid=success-message]')).toContainText('Order completed successfully');
  },

  /**
   * Wait for application to be ready
   */
  async waitForAppReady(page: any) {
    await page.goto('/');
    await expect(page.locator('[data-testid=home-page]')).toBeVisible();
  }
};