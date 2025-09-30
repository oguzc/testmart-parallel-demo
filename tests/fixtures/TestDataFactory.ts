import { v4 as uuidv4 } from 'uuid';
import type { Page } from '@playwright/test';

export interface TestUser {
  id: string;
  email: string;
  name: string;
  password: string;
  username: string;
  phone: string;
}

export interface TestOrder {
  id: string;
  userId: string;
  shippingName: string;
  shippingAddress: string;
  paymentCard: string;
  total: number;
}

export interface TestProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
}

export class TestDataFactory {
  /**
   * Create a unique user for testing
   * Each user has a unique email to avoid conflicts in parallel execution
   */
  static createUser(overrides: Partial<TestUser> = {}): TestUser {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const id = uuidv4();
    
    return {
      id,
      email: `test-user-${timestamp}-${randomId}@testmart.com`,
      name: `Test User ${randomId}`,
      password: 'Password123!',
      username: `testuser_${randomId}`,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      ...overrides
    };
  }

  /**
   * Create a unique product for testing
   */
  static createProduct(overrides: Partial<TestProduct> = {}): TestProduct {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const id = uuidv4();
    
    return {
      id,
      name: `Test Product ${randomId}`,
      price: Math.floor(Math.random() * 500) + 50,
      description: `Test product description ${timestamp}`,
      stock: Math.floor(Math.random() * 100) + 1,
      ...overrides
    };
  }

  /**
   * Generate worker-specific data to ensure test isolation
   * This is crucial for parallel test execution
   */
  static getWorkerSpecificData(workerIndex: number) {
    return {
      userPrefix: `worker${workerIndex}`,
      emailDomain: `testmart.com`,
      productSuffix: `-w${workerIndex}`,
      dataNamespace: `test_data_worker_${workerIndex}`,
      portOffset: workerIndex * 100,
      storagePrefix: `testmart_worker_${workerIndex}_`
    };
  }

  /**
   * Create worker-specific user to avoid conflicts between parallel tests
   */
  static createWorkerSpecificUser(workerIndex: number, overrides: Partial<TestUser> = {}): TestUser {
    const workerData = this.getWorkerSpecificData(workerIndex);
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    
    return this.createUser({
      email: `${workerData.userPrefix}-${timestamp}-${randomId}@${workerData.emailDomain}`,
      name: `${workerData.userPrefix} User ${randomId}`,
      ...overrides
    });
  }

  /**
   * Create worker-specific product to avoid inventory conflicts
   */
  static createWorkerSpecificProduct(workerIndex: number, overrides: Partial<TestProduct> = {}): TestProduct {
    const workerData = this.getWorkerSpecificData(workerIndex);
    const randomId = Math.random().toString(36).substr(2, 9);
    
    return this.createProduct({
      name: `Test Product ${randomId}${workerData.productSuffix}`,
      ...overrides
    });
  }

  /**
   * Generate test data for a complete user flow
   * Includes user registration and product interaction
   */
  static createUserFlowData(workerIndex: number) {
    return {
      user: this.createWorkerSpecificUser(workerIndex),
      products: [
        this.createWorkerSpecificProduct(workerIndex, { name: 'Wireless Headphones', price: 99.99 }),
        this.createWorkerSpecificProduct(workerIndex, { name: 'Gaming Keyboard', price: 149.99 }),
        this.createWorkerSpecificProduct(workerIndex, { name: 'Smartphone', price: 799.99 }),
      ],
      shippingAddress: {
        street: `${Math.floor(Math.random() * 9999)} Test Street`,
        city: `Test City ${workerIndex}`,
        zipCode: `${10000 + workerIndex}${Math.floor(Math.random() * 90)}`
      }
    };
  }

  /**
   * Create worker-specific order to avoid order ID conflicts
   */
  static createWorkerSpecificOrder(workerIndex: number, overrides: Partial<TestOrder> = {}): TestOrder {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    
    return {
      id: `ORDER-W${workerIndex}-${timestamp}-${randomId}`,
      userId: `user-w${workerIndex}-${randomId}`,
      shippingName: `Worker ${workerIndex} Test User`,
      shippingAddress: `${Math.floor(Math.random() * 9999)} Worker ${workerIndex} Street, Test City`,
      paymentCard: '4111111111111111', // Safe test card number
      total: Math.floor(Math.random() * 500) + 50,
      ...overrides
    };
  }

  /**
   * Create worker-specific phone number
   */
  static createWorkerSpecificPhone(workerIndex: number): string {
    const timestamp = Date.now();
    const lastFour = String(timestamp).slice(-4);
    return `+1${workerIndex}00${lastFour}`;
  }

  /**
   * Get a test product (safe to share across workers)
   */
  static getTestProduct(productIndex: number): TestProduct {
    const products = [
      { id: '1', name: 'Wireless Headphones', price: 99.99, description: 'Premium wireless headphones', stock: 100 },
      { id: '2', name: 'Gaming Keyboard', price: 149.99, description: 'Mechanical gaming keyboard', stock: 50 },
      { id: '3', name: 'Smartphone', price: 799.99, description: 'Latest smartphone model', stock: 25 },
      { id: '4', name: 'Laptop', price: 1299.99, description: 'High-performance laptop', stock: 10 },
      { id: '5', name: 'Tablet', price: 449.99, description: '10-inch tablet', stock: 30 }
    ];
    
    return products[productIndex - 1] || products[0];
  }

  /**
   * Helper: Register and login a user (for test setup)
   */
  static async registerAndLoginUser(page: Page, user: TestUser): Promise<void> {
    // Register user
    await page.goto('/register');
    await page.fill('[data-testid=name-input]', user.name);
    await page.fill('[data-testid=email-input]', user.email);
    await page.fill('[data-testid=password-input]', user.password);
    await page.fill('[data-testid=confirm-password-input]', user.password);
    
    // ✅ CRITICAL: Accept terms of service (click label to activate custom checkbox)
    await page.click('label[for="terms-checkbox"]');
    
    await page.click('[data-testid=register-button]');
    
    // ✅ CRITICAL: Wait for navigation (there's a 1.5s delay)
    await page.waitForURL('/', { timeout: 10000 });
    
    // Login user
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', user.email);
    await page.fill('[data-testid=password-input]', user.password);
    await page.click('[data-testid=login-button]');
    
    // Wait for login success
    await page.waitForSelector('[data-testid=welcome-message]', { timeout: 5000 });
  }

  /**
   * Helper: Setup user with cart item (for checkout tests)
   */
  static async setupUserWithCartItem(page: Page, user: TestUser): Promise<void> {
    await this.registerAndLoginUser(page, user);
    
    // Add product to cart
    await page.goto('/products');
    await page.click('[data-testid=product-1] [data-testid=add-to-cart]');
    
    // Verify item added to cart
    await page.waitForSelector('[data-testid=cart-count]:has-text("1")', { timeout: 5000 });
  }

  /**
   * Helper: Setup user with completed order (for order verification tests)
   */
  static async setupUserWithOrder(page: Page, user: TestUser, order: TestOrder): Promise<void> {
    // Setup user with cart item
    await this.setupUserWithCartItem(page, user);
    
    // Complete checkout process
    await page.goto('/checkout');
    await page.fill('[data-testid=order-id-input]', order.id);
    await page.fill('[data-testid=shipping-name]', order.shippingName);
    await page.fill('[data-testid=shipping-address]', order.shippingAddress);
    await page.fill('[data-testid=payment-card]', order.paymentCard);
    
    // Place order
    await page.click('[data-testid=place-order]');
    
    // Wait for order success
    await page.waitForSelector('[data-testid=order-success]', { timeout: 10000 });
  }
}