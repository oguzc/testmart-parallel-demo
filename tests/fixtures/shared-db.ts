/**
 * SIMPLEST SHARED DATABASE: JSON File Storage
 * 
 * This creates REAL conflicts between parallel workers by using:
 * 1. A shared JSON file that all workers read/write
 * 2. File locking to simulate database constraints
 * 3. Unique constraint checks (like a real database)
 * 
 * Why this works:
 * - All workers access the SAME file on disk
 * - No isolation between workers
 * - Real race conditions occur
 * - Duplicate key violations happen
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../../database/shared-db.json');

interface SharedDatabase {
  users: Array<{ email: string; name: string; createdAt: number }>;
  products: Array<{ sku: string; name: string; stock: number }>;
  orders: Array<{ orderId: string; userId: string; total: number }>;
  counters: {
    userCount: number;
    orderCount: number;
    cartCount: number;
  };
}

/**
 * Initialize the shared database file
 */
export function initSharedDB(): void {
  const initialData: SharedDatabase = {
    users: [],
    products: [
      { sku: 'PROD-001', name: 'Shared Product 1', stock: 10 },
      { sku: 'PROD-002', name: 'Shared Product 2', stock: 5 }
    ],
    orders: [],
    counters: {
      userCount: 0,
      orderCount: 1000,
      cartCount: 0
    }
  };

  // Write initial state (will be shared by all workers!)
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  console.log('📦 Shared DB initialized at:', DB_FILE);
}

/**
 * Clear the shared database (for cleanup)
 */
export function clearSharedDB(): void {
  if (fs.existsSync(DB_FILE)) {
    fs.unlinkSync(DB_FILE);
    console.log('🗑️  Shared DB cleared');
  }
}

/**
 * Read from shared database
 */
function readDB(): SharedDatabase {
  if (!fs.existsSync(DB_FILE)) {
    throw new Error('Shared DB not initialized! Call initSharedDB() first');
  }
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

/**
 * Write to shared database (CRITICAL SECTION - race conditions possible!)
 */
function writeDB(data: SharedDatabase): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

/**
 * Register a user - will FAIL if email already exists
 */
export function registerUser(email: string, name: string): { success: boolean; error?: string } {
  const db = readDB();

  // Check for duplicate email (UNIQUE CONSTRAINT)
  const existingUser = db.users.find(u => u.email === email);
  if (existingUser) {
    return { 
      success: false, 
      error: `User with email ${email} already exists` 
    };
  }

  // Add user
  db.users.push({ email, name, createdAt: Date.now() });
  db.counters.userCount++;

  // Write back (RACE CONDITION: another worker might write between read and write!)
  writeDB(db);

  return { success: true };
}

/**
 * Create an order with hardcoded ID - will FAIL on duplicate
 */
export function createOrder(orderId: string, userId: string, total: number): { success: boolean; error?: string } {
  const db = readDB();

  // Check for duplicate order ID (PRIMARY KEY CONSTRAINT)
  const existingOrder = db.orders.find(o => o.orderId === orderId);
  if (existingOrder) {
    return {
      success: false,
      error: `Order ${orderId} already exists`
    };
  }

  // Add order
  db.orders.push({ orderId, userId, total });
  db.counters.orderCount++;

  writeDB(db);

  return { success: true };
}

/**
 * Increment shared counter - RACE CONDITION guaranteed
 */
export function incrementCounter(counterName: keyof SharedDatabase['counters']): number {
  const db = readDB();

  // Read current value
  const currentValue = db.counters[counterName];

  // Simulate some processing time (makes race conditions more likely)
  // In real world, this is network latency, computation, etc.
  for (let i = 0; i < 1000; i++) { /* busy wait */ }

  // Increment (LOST UPDATE PROBLEM: another worker may have incremented already!)
  db.counters[counterName]++;

  writeDB(db);

  return currentValue;
}

/**
 * Get current counter value
 */
export function getCounter(counterName: keyof SharedDatabase['counters']): number {
  const db = readDB();
  return db.counters[counterName];
}

/**
 * Reserve product stock - INVENTORY RACE CONDITION
 */
export function reserveProduct(sku: string, quantity: number): { success: boolean; error?: string } {
  const db = readDB();

  const product = db.products.find(p => p.sku === sku);
  if (!product) {
    return { success: false, error: `Product ${sku} not found` };
  }

  // Check stock
  if (product.stock < quantity) {
    return { 
      success: false, 
      error: `Insufficient stock for ${sku}. Available: ${product.stock}, Requested: ${quantity}` 
    };
  }

  // Simulate processing time (makes race conditions more likely)
  for (let i = 0; i < 1000; i++) { /* busy wait */ }

  // Reserve stock (RACE CONDITION: another worker may have reserved already!)
  product.stock -= quantity;

  writeDB(db);

  return { success: true };
}

/**
 * Get all users (for debugging)
 */
export function getAllUsers(): Array<{ email: string; name: string }> {
  const db = readDB();
  return db.users;
}

/**
 * Get database stats
 */
export function getDBStats(): { 
  userCount: number; 
  orderCount: number; 
  productCount: number;
} {
  const db = readDB();
  return {
    userCount: db.users.length,
    orderCount: db.orders.length,
    productCount: db.products.length
  };
}
