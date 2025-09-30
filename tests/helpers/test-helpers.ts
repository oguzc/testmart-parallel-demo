import type { Page } from '@playwright/test';

/**
 * Test Helper Functions
 * 
 * Reusable functions for common test operations across all e2e tests.
 * These helpers reduce code duplication and make tests more maintainable.
 * 
 * Uses selectors from good-architecture examples for consistency.
 */

// ===== REGISTRATION HELPERS =====

export async function fillRegistrationForm(
  page: Page, 
  user: { name: string; email: string; password: string },
  confirmPassword?: string
) {
  await page.getByTestId('name-input').fill(user.name);
  await page.getByTestId('email-input').fill(user.email);
  await page.getByTestId('password-input').fill(user.password);
  await page.getByTestId('confirm-password-input').fill(confirmPassword || user.password);
  
  // Accept terms and conditions - same selector as good examples
  await page.locator('label').filter({ hasText: 'I agree to the Terms of' }).locator('.checkbox-custom').click();
}

export async function submitRegistration(page: Page) {
  await page.getByTestId('register-button').click();
}

export async function registerUser(
  page: Page, 
  user: { name: string; email: string; password: string }
) {
  await page.goto('/register');
  await fillRegistrationForm(page, user);
  await submitRegistration(page);
  // Wait for successful registration and redirect to home
  await page.waitForURL('/', { timeout: 10000 });
  // Wait for auth state to propagate - user name should appear in header
  await page.getByTestId('user-name').waitFor({ state: 'visible', timeout: 10000 });
}

// ===== LOGIN HELPERS =====

export async function fillLoginForm(page: Page, email: string, password: string) {
  await page.getByTestId('email-input').fill(email);
  await page.getByTestId('password-input').fill(password);
}

export async function submitLogin(page: Page) {
  await page.getByTestId('login-button').click();
}

export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await fillLoginForm(page, email, password);
  await submitLogin(page);
  // Wait for successful login and redirect to home
  await page.waitForURL('/', { timeout: 10000 });
}

export async function logout(page: Page) {
  await page.getByTestId('logout-button').click();
}

// ===== PRODUCT HELPERS =====

export async function addFirstProductToCart(page: Page) {
  await page.goto('/products');
  await page.waitForSelector('[data-testid=product-card]', { timeout: 10000 });
  // Click product card to go to detail page
  await page.getByTestId('product-card').first().click();
  // Add to cart from detail page
  await page.getByTestId('add-to-cart-button').click();
  // Wait for cart update
  await page.waitForTimeout(500);
}

export async function addProductToCart(page: Page, productId: string) {
  await page.locator(`[data-testid="add-to-cart-${productId}"]`).click();
}

// ===== CHECKOUT HELPERS =====

export async function fillShippingAddress(
  page: Page,
  address: { street: string; city: string; zipCode: string }
) {
  await page.getByTestId('address-input').fill(address.street);
  await page.getByTestId('city-input').fill(address.city);
  await page.getByTestId('zip-input').fill(address.zipCode);
}

export async function completeOrder(page: Page) {
  await page.getByTestId('complete-order').click();
}

export async function proceedToCheckout(page: Page) {
  await page.goto('/cart');
  await page.getByTestId('checkout-button').click();
}

// ===== COMPOSITE HELPERS =====

/**
 * Register a new user and add a product to their cart
 * Common setup for checkout and cart tests
 */
export async function setupUserWithCart(
  page: Page,
  user: { name: string; email: string; password: string }
) {
  await registerUser(page, user);
  await addFirstProductToCart(page);
}

/**
 * Complete full user flow: register, add to cart, checkout
 */
export async function completeFullCheckoutFlow(
  page: Page,
  user: { name: string; email: string; password: string },
  address: { street: string; city: string; zipCode: string }
) {
  await setupUserWithCart(page, user);
  await proceedToCheckout(page);
  await fillShippingAddress(page, address);
  await completeOrder(page);
}
