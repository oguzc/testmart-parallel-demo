import { v4 as uuidv4 } from 'uuid';
import type { User, Product, CartItem, Order } from '../types';

export class TestDataFactory {
  static createUser(overrides: Partial<User> = {}): User {
    const id = uuidv4();
    return {
      id,
      email: `user-${id.slice(0, 8)}@testmart.com`,
      name: `Test User ${id.slice(0, 8)}`,
      password: 'TestPassword123!',
      ...overrides
    };
  }

  static createProduct(overrides: Partial<Product> = {}): Product {
    const id = uuidv4();
    const productNames = [
      'Wireless Headphones', 'Gaming Keyboard', 'Smartphone', 
      'Laptop', 'Coffee Maker', 'Running Shoes', 'Backpack',
      'Tablet', 'Smart Watch', 'Bluetooth Speaker'
    ];
    
    return {
      id,
      name: productNames[Math.floor(Math.random() * productNames.length)] + ` ${id.slice(0, 4)}`,
      price: Math.floor(Math.random() * 500) + 50,
      description: `High-quality product with excellent features - ${id}`,
      stock: Math.floor(Math.random() * 100) + 1,
      image: `https://via.placeholder.com/300x200?text=Product+${id.slice(0, 4)}`,
      ...overrides
    };
  }

  static createCartItem(overrides: Partial<CartItem> = {}): CartItem {
    const id = uuidv4();
    return {
      id,
      productId: uuidv4(),
      quantity: Math.floor(Math.random() * 5) + 1,
      ...overrides
    };
  }

  static createOrder(overrides: Partial<Order> = {}): Order {
    const id = uuidv4();
    return {
      id,
      userId: uuidv4(),
      items: [this.createCartItem()],
      total: Math.floor(Math.random() * 1000) + 100,
      status: 'pending',
      createdAt: new Date().toISOString(),
      shippingAddress: {
        street: `${Math.floor(Math.random() * 999) + 1} Test Street`,
        city: 'Test City',
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`
      },
      ...overrides
    };
  }

  // Generate worker-specific data to avoid conflicts in parallel tests
  static getWorkerSpecificData(workerIndex: number) {
    return {
      userPrefix: `worker${workerIndex}`,
      emailDomain: `worker${workerIndex}.testmart.com`,
      productSuffix: `-w${workerIndex}`,
      portOffset: workerIndex * 10,
      dbSuffix: `_worker_${workerIndex}`
    };
  }

  // Create data specific to a test worker to ensure isolation
  static createWorkerSpecificUser(workerIndex: number, overrides: Partial<User> = {}): User {
    const workerData = this.getWorkerSpecificData(workerIndex);
    const id = uuidv4();
    
    return this.createUser({
      email: `${workerData.userPrefix}-${id.slice(0, 8)}@${workerData.emailDomain}`,
      ...overrides
    });
  }

  static createWorkerSpecificProduct(workerIndex: number, overrides: Partial<Product> = {}): Product {
    const workerData = this.getWorkerSpecificData(workerIndex);
    
    return this.createProduct({
      name: (overrides.name || 'Test Product') + workerData.productSuffix,
      ...overrides
    });
  }
}