import type { User, Product, CartItem, Order } from '../types';

/**
 * API-backed Data Store for TestMart
 * 
 * This replaces MockDataStore with a real API backend.
 * All users and test workers access the SAME shared database via HTTP.
 * 
 * This demonstrates real database conflicts in parallel testing!
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export class ApiDataStore {
  // ===== USER METHODS =====

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(id)}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  static async createUser(user: User): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: user.id,
        name: user.name, 
        email: user.email, 
        password: user.password 
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create user');
    }

    return await response.json();
  }

  // ===== PRODUCT METHODS =====

  static async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  static async createProduct(product: Product): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create product');
    }

    return await response.json();
  }

  static async updateProductStock(id: string, newStock: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/products/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: newStock })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update stock');
    }
  }

  // ===== CART METHODS =====

  static async createCartItem(item: CartItem): Promise<CartItem> {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add to cart');
    }

    return await response.json();
  }

  static async getCartItemsByUserId(userId: string): Promise<CartItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart?userId=${encodeURIComponent(userId)}`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error fetching cart items:', error);
      return [];
    }
  }

  static async updateCartItem(item: CartItem): Promise<CartItem> {
    const response = await fetch(`${API_BASE_URL}/cart/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update cart');
    }

    return await response.json();
  }

  static async removeCartItem(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/cart/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove from cart');
    }
  }

  static async clearCart(userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/cart/clear?userId=${userId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to clear cart');
    }
  }

  // ===== ORDER METHODS =====

  static async createOrder(order: Order): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create order');
    }

    return await response.json();
  }

  static async getOrdersByUserId(userId: string): Promise<Order[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders?userId=${encodeURIComponent(userId)}`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  // ===== INITIALIZATION (for compatibility with MockDataStore) =====

  static async initializeSampleData(): Promise<void> {
    // API server initializes its own data
    console.log('API server handles data initialization');
  }

  static clearAllData(): void {
    // In API mode, we use the admin/reset endpoint
    fetch(`${API_BASE_URL}/admin/reset`, { method: 'POST' })
      .catch(err => console.error('Error resetting database:', err));
  }

  // ===== ADMIN/TESTING METHODS =====

  static async resetDatabase(): Promise<void> {
    await fetch(`${API_BASE_URL}/admin/reset`, { method: 'POST' });
  }

  static async getStats(): Promise<{ userCount: number; productCount: number; orderCount: number; counters: Record<string, number> } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  }
}
