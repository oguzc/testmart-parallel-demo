import { test, expect } from '@playwright/test';

/**
 * BAD ARCHITECTURE EXAMPLE: Hardcoded Data Conflicts
 * 
 * This demonstrates what happens when you use hardcoded data in parallel execution.
 * These tests WILL FAIL when run with multiple workers because:
 * 
 * 1. Multiple workers try to use the same usernames
 * 2. Fixed email addresses cause registration conflicts
 * 3. Hardcoded product names create inventory issues
 * 4. Tests depend on each other's execution order
 * 
 * Run with: npx playwright test tests/examples/bad-architecture/hardcoded-data.spec.ts --workers=4
 * Expected result: Most tests will fail with "already exists" errors
 */

// PROBLEM 1: Hardcoded user data - multiple workers will conflict
const FIXED_USER_DATA = {
  username: 'testuser123',
  email: 'testuser@testmart.com',
  phone: '+1-555-123-4567',
  firstName: 'Test',
  lastName: 'User'
};

test.describe('BAD: Hardcoded Data Conflicts', () => {
  
  test('register user with fixed username - guaranteed conflicts', async ({ page }) => {
    console.log(`BAD: All workers trying to register username: ${FIXED_USER_DATA.username}`);
    
    await page.goto('/register');
    
    await page.getByTestId('name-input').fill(`${FIXED_USER_DATA.firstName} ${FIXED_USER_DATA.lastName}`);
    await page.getByTestId('email-input').fill(FIXED_USER_DATA.email);
    await page.getByTestId('password-input').fill('Password123!');
    await page.getByTestId('confirm-password-input').fill('Password123!');
    
    await page.locator('label').filter({ hasText: 'I agree to the Terms of' }).locator('.checkbox-custom').click();
    
    await page.getByTestId('register-button').click();
    
    // This will FAIL for workers that don't register first
    await expect(page).toHaveURL('/', { timeout: 10000 });
    console.log(`BAD: Registration succeeded - this worker was first!`);
  });

  test('add same product to cart - inventory conflicts', async ({ page }) => {
    console.log(`BAD: All workers trying to add the same product`);
    
    await page.goto('/register');
    await page.getByTestId('name-input').fill(`${FIXED_USER_DATA.firstName} ${FIXED_USER_DATA.lastName}`);
    await page.getByTestId('email-input').fill(FIXED_USER_DATA.email);
    await page.getByTestId('password-input').fill('Password123!');
    await page.getByTestId('confirm-password-input').fill('Password123!');
    await page.locator('label').filter({ hasText: 'I agree to the Terms of' }).locator('.checkbox-custom').click();
    
    await page.getByTestId('register-button').click();
    await expect(page).toHaveURL('/', { timeout: 10000 });
    
    await page.goto('/products');
    await page.waitForSelector('[data-testid=product-card]', { timeout: 10000 });
    
    await page.getByTestId('product-card').first().click();
    await page.getByTestId('add-to-cart-button').click();
  });

  test('place order with fixed data', async ({ page }) => {
    console.log(`BAD: All workers trying to place order with same data`);
    
    await page.goto('/register');
    await page.getByTestId('name-input').fill(`${FIXED_USER_DATA.firstName} ${FIXED_USER_DATA.lastName}`);
    await page.getByTestId('email-input').fill(FIXED_USER_DATA.email);
    await page.getByTestId('password-input').fill('Password123!');
    await page.getByTestId('confirm-password-input').fill('Password123!');
    await page.locator('label').filter({ hasText: 'I agree to the Terms of' }).locator('.checkbox-custom').click();
    
    await page.getByTestId('register-button').click();
    await expect(page).toHaveURL('/', { timeout: 10000 });
    
    await page.goto('/products');
    await page.waitForSelector('[data-testid=product-card]', { timeout: 10000 });
    await page.getByTestId('product-card').first().click();
    await page.getByTestId('add-to-cart-button').click();
    await page.getByTestId('cart-button').click();
    await page.getByTestId('checkout-button').click();
    
    await page.getByTestId('address-input').fill('123 Fixed Address St');
    await page.getByTestId('city-input').fill('Fixed City');
    await page.getByTestId('zip-input').fill('12345');
    await page.getByTestId('complete-order').click();
  });
});
