import type { User, Product, CartItem, Order } from '../types';

// Simple localStorage-backed data store for demo purposes
// In a real app, this would be replaced with a proper database
export class MockDataStore {
  private static STORAGE_KEYS = {
    USERS: 'testmart_db_users',
    PRODUCTS: 'testmart_db_products',
    CART_ITEMS: 'testmart_db_cart_items',
    ORDERS: 'testmart_db_orders'
  };

  // Helper methods for localStorage persistence
  private static loadFromStorage<T>(key: string): Map<string, T> {
    // Check if localStorage is available (not in Node.js context)
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return new Map();
    }
    
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const obj = JSON.parse(data);
        return new Map(Object.entries(obj));
      }
    } catch (error) {
      console.error(`Error loading ${key} from storage:`, error);
    }
    return new Map();
  }

  private static saveToStorage<T>(key: string, map: Map<string, T>): void {
    // Check if localStorage is available (not in Node.js context)
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      const obj = Object.fromEntries(map);
      localStorage.setItem(key, JSON.stringify(obj));
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
    }
  }

  private static get users(): Map<string, User> {
    return this.loadFromStorage<User>(this.STORAGE_KEYS.USERS);
  }

  private static get products(): Map<string, Product> {
    return this.loadFromStorage<Product>(this.STORAGE_KEYS.PRODUCTS);
  }

  private static get cartItems(): Map<string, CartItem> {
    return this.loadFromStorage<CartItem>(this.STORAGE_KEYS.CART_ITEMS);
  }

  private static get orders(): Map<string, Order> {
    return this.loadFromStorage<Order>(this.STORAGE_KEYS.ORDERS);
  }
  
  // User operations
  static async createUser(user: User): Promise<User> {
    const users = this.users;
    if (users.has(user.email)) {
      throw new Error('User with this email already exists');
    }
    users.set(user.email, user);
    this.saveToStorage(this.STORAGE_KEYS.USERS, users);
    return user;
  }
  
  static async getUserByEmail(email: string): Promise<User | null> {
    return this.users.get(email) || null;
  }
  
  static async getUserById(id: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.id === id) return user;
    }
    return null;
  }
  
  // Product operations
  static async createProduct(product: Product): Promise<Product> {
    const products = this.products;
    products.set(product.id, product);
    this.saveToStorage(this.STORAGE_KEYS.PRODUCTS, products);
    return product;
  }
  
  static async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  static async getProductById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }
  
  static async updateProductStock(id: string, newStock: number): Promise<void> {
    const products = this.products;
    const product = products.get(id);
    if (product) {
      product.stock = newStock;
      products.set(id, product);
      this.saveToStorage(this.STORAGE_KEYS.PRODUCTS, products);
    }
  }
  
  // Cart operations
  static async createCartItem(item: CartItem): Promise<CartItem> {
    const cartItems = this.cartItems;
    cartItems.set(item.id, item);
    this.saveToStorage(this.STORAGE_KEYS.CART_ITEMS, cartItems);
    return item;
  }
  
  static async getCartItemsByUserId(userId: string): Promise<CartItem[]> {
    // In a real app, we'd filter by user session or user ID
    // For demo purposes, we'll return all cart items
    console.log('Getting cart items for user:', userId);
    return Array.from(this.cartItems.values());
  }
  
  static async updateCartItem(item: CartItem): Promise<CartItem> {
    const cartItems = this.cartItems;
    cartItems.set(item.id, item);
    this.saveToStorage(this.STORAGE_KEYS.CART_ITEMS, cartItems);
    return item;
  }
  
  static async removeCartItem(id: string): Promise<void> {
    const cartItems = this.cartItems;
    cartItems.delete(id);
    this.saveToStorage(this.STORAGE_KEYS.CART_ITEMS, cartItems);
  }
  
  // Order operations
  static async createOrder(order: Order): Promise<Order> {
    const orders = this.orders;
    orders.set(order.id, order);
    this.saveToStorage(this.STORAGE_KEYS.ORDERS, orders);
    return order;
  }
  
  static async getOrdersByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }
  
  // Cleanup methods for testing
  static clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEYS.USERS);
    localStorage.removeItem(this.STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(this.STORAGE_KEYS.CART_ITEMS);
    localStorage.removeItem(this.STORAGE_KEYS.ORDERS);
  }
  
  static clearUserData(): void {
    localStorage.removeItem(this.STORAGE_KEYS.USERS);
  }
  
  static clearProductData(): void {
    localStorage.removeItem(this.STORAGE_KEYS.PRODUCTS);
  }
  
  // Initialize with some sample data
  static async initializeSampleData(): Promise<void> {
    // Only initialize if products don't already exist
    const existingProducts = await this.getProducts();
    if (existingProducts.length > 0) {
      console.log('Sample data already initialized, skipping...');
      return;
    }
    
    // Sample products
    const sampleProducts: Product[] = [
      {
        id: 'prod-1',
        name: 'Wireless Bluetooth Headphones',
        price: 99.99,
        description: 'High-quality wireless headphones with noise cancellation',
        stock: 50,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&crop=center'
      },
      {
        id: 'prod-2',
        name: 'Gaming Mechanical Keyboard',
        price: 149.99,
        description: 'RGB backlit mechanical keyboard for gaming',
        stock: 30,
        image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop&crop=center'
      },
      {
        id: 'prod-3',
        name: 'Smartphone Pro Max',
        price: 999.99,
        description: 'Latest flagship smartphone with advanced camera',
        stock: 25,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop&crop=center'
      },
      {
        id: 'prod-4',
        name: 'Ultrabook Laptop',
        price: 1299.99,
        description: 'Lightweight laptop perfect for work and study',
        stock: 15,
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop&crop=center'
      },
      {
        id: 'prod-5',
        name: 'Smart Coffee Maker',
        price: 199.99,
        description: 'Wi-Fi enabled coffee maker with app control',
        stock: 40,
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&crop=center'
      }
    ];
    
    for (const product of sampleProducts) {
      await this.createProduct(product);
    }
  }
}