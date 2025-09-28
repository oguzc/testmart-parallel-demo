import { v4 as uuidv4 } from 'uuid';

export interface TestUser {
  id: string;
  email: string;
  name: string;
  password: string;
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
      password: 'TestPassword123!',
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
      emailDomain: `worker${workerIndex}.testmart.local`,
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
}