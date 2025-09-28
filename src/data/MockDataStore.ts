import type { User, Product, CartItem, Order } from '../types';

// Simple in-memory data store for demo purposes
// In a real app, this would be replaced with a proper database
export class MockDataStore {
  private static users: Map<string, User> = new Map();
  private static products: Map<string, Product> = new Map();
  private static cartItems: Map<string, CartItem> = new Map();
  private static orders: Map<string, Order> = new Map();
  
  // User operations
  static async createUser(user: User): Promise<User> {
    if (this.users.has(user.email)) {
      throw new Error('User with this email already exists');
    }
    this.users.set(user.email, user);
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
    this.products.set(product.id, product);
    return product;
  }
  
  static async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  static async getProductById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }
  
  static async updateProductStock(id: string, newStock: number): Promise<void> {
    const product = this.products.get(id);
    if (product) {
      product.stock = newStock;
      this.products.set(id, product);
    }
  }
  
  // Cart operations
  static async createCartItem(item: CartItem): Promise<CartItem> {
    this.cartItems.set(item.id, item);
    return item;
  }
  
  static async getCartItemsByUserId(userId: string): Promise<CartItem[]> {
    // In a real app, we'd filter by user session or user ID
    // For demo purposes, we'll return all cart items
    return Array.from(this.cartItems.values());
  }
  
  static async updateCartItem(item: CartItem): Promise<CartItem> {
    this.cartItems.set(item.id, item);
    return item;
  }
  
  static async removeCartItem(id: string): Promise<void> {
    this.cartItems.delete(id);
  }
  
  // Order operations
  static async createOrder(order: Order): Promise<Order> {
    this.orders.set(order.id, order);
    return order;
  }
  
  static async getOrdersByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }
  
  // Cleanup methods for testing
  static clearAllData(): void {
    this.users.clear();
    this.products.clear();
    this.cartItems.clear();
    this.orders.clear();
  }
  
  static clearUserData(): void {
    this.users.clear();
  }
  
  static clearProductData(): void {
    this.products.clear();
  }
  
  // Initialize with some sample data
  static async initializeSampleData(): Promise<void> {
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