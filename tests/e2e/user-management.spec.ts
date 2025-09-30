import { test, expect } from '@playwright/test';
import { TestDataFactory } from '../fixtures/TestDataFactory';
import { 
  registerUser, 
  fillRegistrationForm, 
  submitRegistration,
  fillLoginForm,
  submitLogin,
  logout
} from '../helpers/test-helpers';

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
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);

    await registerUser(page, user);
    
    // Verify successful registration
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('user-name')).toContainText(user.name);
  });

  test('should handle validation errors properly', async ({ page }, testInfo) => {
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);

    await page.goto('/register');
    await fillRegistrationForm(page, user, 'different-password');
    await submitRegistration(page);
    
    // Should show validation error
    await expect(page.locator('[data-testid=error-message]'))
      .toContainText('Passwords do not match');
    
    // Should remain on registration page
    await expect(page).toHaveURL('/register');
  });

  test('should prevent duplicate email registration', async ({ page }, testInfo) => {
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);

    // Register user first time
    await registerUser(page, user);
    await expect(page).toHaveURL('/');
    
    // Try to register with same email
    await page.goto('/register');
    await fillRegistrationForm(page, {
      name: 'Different Name',
      email: user.email,
      password: 'differentpass123'
    });
    await submitRegistration(page);
    
    // Should show duplicate email error
    await expect(page.locator('[data-testid=error-message]'))
      .toContainText('already exists');
  });

  test('should require all fields for registration', async ({ page }) => {
    await page.goto('/register');
    
    // Try to submit empty form - button should be disabled
    await expect(page.getByTestId('register-button')).toBeDisabled();
    
    // Form should remain on registration page
    await expect(page).toHaveURL('/register');
    
    // Check that required validation is working
    const nameField = page.getByTestId('name-input');
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
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);

    // First register the user
    await registerUser(page, user);
    
    // Logout to test login
    await logout(page);
    
    // Now test login
    await page.goto('/login');
    await fillLoginForm(page, user.email, user.password);
    await submitLogin(page);
    
    // Verify successful login
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('user-name')).toContainText(user.name);
  });

  test('should reject invalid credentials', async ({ page }, testInfo) => {
    const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);

    await page.goto('/login');
    await fillLoginForm(page, user.email, user.password);
    await submitLogin(page);
    
    // Should show error message
    await expect(page.locator('[data-testid=error-message]'))
      .toContainText('User not found');
    
    // Should remain on login page
    await expect(page).toHaveURL('/login');
  });
});