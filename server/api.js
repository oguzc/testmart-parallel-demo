/**
 * Simple Express API Server for TestMart
 * 
 * This server provides a REST API to access the shared JSON database.
 * All users (browser sessions) and test workers access the SAME database.
 * 
 * This demonstrates real database conflicts in parallel testing!
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, '../database/shared-db.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper functions to read/write database
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    // This should never happen since database/shared-db.json is committed to git
    // But just in case, create an empty structure
    const initialData = {
      users: [],
      products: [],
      cartItems: [],
      orders: [],
      counters: { userCount: 0, orderCount: 1000, cartCount: 0 }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
  
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ===== USER ENDPOINTS =====

app.get('/api/users', (req, res) => {
  const db = readDB();
  res.json(db.users);
});

app.get('/api/users/:email', (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.email === req.params.email);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/users', (req, res) => {
  const db = readDB();
  const { email, name, password } = req.body;
  
  // Check if user already exists
  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ error: `User with email ${email} already exists` });
  }
  
  const newUser = {
    email,
    name,
    password, // In real app, this would be hashed!
    createdAt: Date.now()
  };
  
  db.users.push(newUser);
  db.counters.userCount++;
  writeDB(db);
  
  res.status(201).json(newUser);
});

app.post('/api/auth/login', (req, res) => {
  const db = readDB();
  const { email, password } = req.body;
  
  const user = db.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({ 
      success: true, 
      user: { email: user.email, name: user.name }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// ===== PRODUCT ENDPOINTS =====

app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json(db.products);
});

app.get('/api/products/:id', (req, res) => {
  const db = readDB();
  // Support both id and sku lookup
  const product = db.products.find(p => p.id === req.params.id || p.sku === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.patch('/api/products/:id/stock', (req, res) => {
  const db = readDB();
  const { stock } = req.body;
  
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  product.stock = stock;
  writeDB(db);
  
  res.json({ success: true, product });
});

app.post('/api/products/reserve', (req, res) => {
  const db = readDB();
  const { sku, quantity } = req.body;
  
  const product = db.products.find(p => p.sku === sku);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  if (product.stock < quantity) {
    return res.status(400).json({ 
      error: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}` 
    });
  }
  
  // NOTE: Stock is NOT decreased here - only checked for availability
  // Stock should only decrease when an order is completed, not when added to cart
  // product.stock -= quantity;
  // writeDB(db);
  
  res.json({ success: true, remainingStock: product.stock });
});

// ===== CART ENDPOINTS =====

app.get('/api/cart', (req, res) => {
  const db = readDB();
  const { userId } = req.query;
  
  if (!db.cartItems) {
    db.cartItems = [];
  }
  
  if (userId) {
    const userCart = db.cartItems.filter(item => item.userId === userId);
    res.json(userCart);
  } else {
    res.json(db.cartItems);
  }
});

app.post('/api/cart', (req, res) => {
  const db = readDB();
  
  if (!db.cartItems) {
    db.cartItems = [];
  }
  
  const newItem = {
    ...req.body,
    createdAt: Date.now()
  };
  
  db.cartItems.push(newItem);
  writeDB(db);
  
  res.status(201).json(newItem);
});

app.put('/api/cart/:id', (req, res) => {
  const db = readDB();
  
  if (!db.cartItems) {
    db.cartItems = [];
  }
  
  const itemIndex = db.cartItems.findIndex(item => item.id === req.params.id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Cart item not found' });
  }
  
  db.cartItems[itemIndex] = { ...db.cartItems[itemIndex], ...req.body };
  writeDB(db);
  
  res.json(db.cartItems[itemIndex]);
});

app.delete('/api/cart/:id', (req, res) => {
  const db = readDB();
  
  if (!db.cartItems) {
    db.cartItems = [];
  }
  
  const initialLength = db.cartItems.length;
  db.cartItems = db.cartItems.filter(item => item.id !== req.params.id);
  
  if (db.cartItems.length === initialLength) {
    return res.status(404).json({ error: 'Cart item not found' });
  }
  
  writeDB(db);
  res.json({ success: true });
});

app.delete('/api/cart/clear', (req, res) => {
  const db = readDB();
  const { userId } = req.query;
  
  if (!db.cartItems) {
    db.cartItems = [];
  }
  
  if (userId) {
    db.cartItems = db.cartItems.filter(item => item.userId !== userId);
  } else {
    db.cartItems = [];
  }
  
  writeDB(db);
  res.json({ success: true });
});

// ===== ORDER ENDPOINTS =====

app.get('/api/orders', (req, res) => {
  const db = readDB();
  const { userId } = req.query;
  
  if (userId) {
    const userOrders = db.orders.filter(o => o.userId === userId);
    res.json(userOrders);
  } else {
    res.json(db.orders);
  }
});

app.post('/api/orders', (req, res) => {
  const db = readDB();
  const { userId, items, total, address } = req.body;
  
  const orderId = `ORDER-${db.counters.orderCount}`;
  
  const newOrder = {
    orderId,
    userId,
    items,
    total,
    address,
    createdAt: Date.now()
  };
  
  db.orders.push(newOrder);
  db.counters.orderCount++;
  writeDB(db);
  
  res.status(201).json(newOrder);
});

// ===== COUNTER ENDPOINTS =====

app.post('/api/counters/increment', (req, res) => {
  const db = readDB();
  const { counter } = req.body;
  
  if (db.counters[counter] === undefined) {
    return res.status(400).json({ error: 'Invalid counter name' });
  }
  
  const oldValue = db.counters[counter];
  db.counters[counter]++;
  writeDB(db);
  
  res.json({ 
    counter, 
    oldValue, 
    newValue: db.counters[counter] 
  });
});

// ===== ADMIN/TESTING ENDPOINTS =====

app.post('/api/admin/reset', (req, res) => {
  // Load from initial-db.json instead of hardcoding
  const initialDbPath = path.join(__dirname, '../database/initial-db.json');
  
  if (fs.existsSync(initialDbPath)) {
    const initialData = JSON.parse(fs.readFileSync(initialDbPath, 'utf-8'));
    writeDB(initialData);
    res.json({ success: true, message: 'Database reset to initial state from initial-db.json' });
  } else {
    res.status(500).json({ error: 'initial-db.json not found' });
  }
});

app.get('/api/admin/stats', (req, res) => {
  const db = readDB();
  res.json({
    userCount: db.users.length,
    productCount: db.products.length,
    orderCount: db.orders.length,
    counters: db.counters
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TestMart API Server running at http://localhost:${PORT}`);
  console.log(`📦 Database: ${DB_FILE}`);
  console.log(`\n📊 Available endpoints:`);
  console.log(`   GET    /api/users`);
  console.log(`   POST   /api/users`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/products`);
  console.log(`   POST   /api/products/reserve`);
  console.log(`   GET    /api/orders`);
  console.log(`   POST   /api/orders`);
  console.log(`   POST   /api/admin/reset`);
  console.log(`   GET    /api/admin/stats`);
});
