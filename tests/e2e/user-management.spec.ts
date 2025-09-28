import { test, expect } from '@playwright/test';
import { TestDataFactory } from '../fixtures/TestDataFactory';

/**
 * User Registration Tests - Parallel Execution Scenarios
 * 
 * These tests demonstrate common parallel testing challenges:
 * 1. Unique user data generation
 * 2. Email uniqueness conflicts
 * 3. Form validation in parallel contexts
 */

test.describe('User Registration - Parallel Safe', () => {
  test('should register new user successfully', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const user = TestDataFactory.createWorkerSpecificUser(workerIndex);

    await page.goto('/register');
    
    // Fill registration form with unique data
    await page.fill('[data-testid=name-input]', user.name);
    await page.fill('[data-testid=email-input]', user.email);
    await page.fill('[data-testid=password-input]', user.password);
    await page.fill('[data-testid=confirm-password-input]', user.password);
    
    await page.click('[data-testid=register-button]');
    
    // Verify successful registration
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid=welcome-message]'))
      .toContainText(user.name);
  });

  test('should handle validation errors properly', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const user = TestDataFactory.createWorkerSpecificUser(workerIndex);

    await page.goto('/register');
    
    // Try to register with mismatched passwords
    await page.fill('[data-testid=name-input]', user.name);
    await page.fill('[data-testid=email-input]', user.email);
    await page.fill('[data-testid=password-input]', user.password);
    await page.fill('[data-testid=confirm-password-input]', 'different-password');
    
    await page.click('[data-testid=register-button]');
    
    // Should show validation error
    await expect(page.locator('[data-testid=error-message]'))
      .toContainText('Passwords do not match');
    
    // Should remain on registration page
    await expect(page).toHaveURL('/register');
  });

  test('should prevent duplicate email registration', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const user = TestDataFactory.createWorkerSpecificUser(workerIndex);

    // Register user first time
    await page.goto('/register');
    await page.fill('[data-testid=name-input]', user.name);
    await page.fill('[data-testid=email-input]', user.email);
    await page.fill('[data-testid=password-input]', user.password);
    await page.fill('[data-testid=confirm-password-input]', user.password);
    await page.click('[data-testid=register-button]');
    
    // Verify first registration was successful
    await expect(page).toHaveURL('/');
    
    // Try to register with same email
    await page.goto('/register');
    await page.fill('[data-testid=name-input]', 'Different Name');
    await page.fill('[data-testid=email-input]', user.email);
    await page.fill('[data-testid=password-input]', 'differentpass123');
    await page.fill('[data-testid=confirm-password-input]', 'differentpass123');
    await page.click('[data-testid=register-button]');
    
    // Should show duplicate email error
    await expect(page.locator('[data-testid=error-message]'))
      .toContainText('User with this email already exists');
  });

  test('should require all fields for registration', async ({ page }) => {
    await page.goto('/register');
    
    // Try to submit empty form
    await page.click('[data-testid=register-button]');
    
    // Form should not submit due to HTML5 validation
    await expect(page).toHaveURL('/register');
    
    // Check that required validation is working
    const nameField = page.locator('[data-testid=name-input]');
    await expect(nameField).toHaveAttribute('required');
  });
});

/**
 * User Login Tests - Parallel Execution Scenarios
 * 
 * These tests show how to handle user authentication in parallel contexts
 */
test.describe('User Login - Parallel Safe', () => {
  test('should login with valid credentials', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const user = TestDataFactory.createWorkerSpecificUser(workerIndex);

    // First register the user
    await page.goto('/register');
    await page.fill('[data-testid=name-input]', user.name);
    await page.fill('[data-testid=email-input]', user.email);
    await page.fill('[data-testid=password-input]', user.password);
    await page.fill('[data-testid=confirm-password-input]', user.password);
    await page.click('[data-testid=register-button]');
    
    // Logout to test login
    await page.click('[data-testid=logout-button]');
    
    // Now test login
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', user.email);
    await page.fill('[data-testid=password-input]', user.password);
    await page.click('[data-testid=login-button]');
    
    // Verify successful login
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid=welcome-message]'))
      .toContainText(user.name);
  });

  test('should reject invalid credentials', async ({ page }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const user = TestDataFactory.createWorkerSpecificUser(workerIndex);

    await page.goto('/login');
    
    // Try to login with non-existent user
    await page.fill('[data-testid=email-input]', user.email);
    await page.fill('[data-testid=password-input]', user.password);
    await page.click('[data-testid=login-button]');
    
    // Should show error message
    await expect(page.locator('[data-testid=error-message]'))
      .toContainText('Login failed');
    
    // Should remain on login page
    await expect(page).toHaveURL('/login');
  });
});