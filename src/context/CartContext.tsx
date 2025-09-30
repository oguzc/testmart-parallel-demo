import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CartItem, CartContextType } from '../types';
import { ApiDataStore } from '../data/ApiDataStore';
import { useAuth } from './AuthContext';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  // Load cart from backend when user changes
  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        // Clear cart when user logs out
        setItems([]);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch cart from backend API
        const response = await fetch(`http://localhost:3001/api/cart?userId=${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const backendCart = await response.json();
          
          // Load product details for each cart item
          const cartWithProducts = await Promise.all(
            backendCart.map(async (item: { productId: string; id: string; quantity: number; userId: string }) => {
              const product = await ApiDataStore.getProductById(item.productId);
              return {
                ...item,
                product
              };
            })
          );
          
          setItems(cartWithProducts);
        } else {
          console.error('Failed to load cart from backend');
          setItems([]);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        setItems([]);
      }
    };

    loadCart();
  }, [user]);

  const addToCart = async (productId: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be logged in to add items to cart');
    }

    try {
      const product = await ApiDataStore.getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      if (product.stock <= 0) {
        throw new Error('Product out of stock');
      }

      // Check if item already exists in cart
      const existingItem = items.find(item => item.productId === productId);
      
      if (existingItem) {
        // Update quantity in backend
        const response = await fetch(`http://localhost:3001/api/cart/${existingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: existingItem.quantity + 1
          })
        });

        if (response.ok) {
          const updated = await response.json();
          setItems(currentItems =>
            currentItems.map(item =>
              item.id === existingItem.id
                ? { ...item, quantity: updated.quantity }
                : item
            )
          );
        }
      } else {
        // Add new item to backend
        const newItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: user.email,
          productId,
          quantity: 1
        };

        const response = await fetch('http://localhost:3001/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem)
        });

        if (response.ok) {
          const created = await response.json();
          setItems(currentItems => [...currentItems, { ...created, product }]);
        }
      }

      // Stock reservation is handled by the reserve endpoint
      // await ApiDataStore.reserveProduct(productId, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:3001/api/cart/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setItems(currentItems => currentItems.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number): Promise<void> => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });

      if (response.ok) {
        setItems(currentItems =>
          currentItems.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const clearCart = async (): Promise<void> => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:3001/api/cart/clear?userId=${encodeURIComponent(user.email)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setItems([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const getTotal = (): number => {
    return items.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getItemCount = (): number => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};