import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { MockDataStore } from '../data/MockDataStore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SignInNotice from '../components/SignInNotice';
import ProductCard from '../components/ProductCard';
import FormCard from '../components/FormCard';
import type { Product } from '../types';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const loadedProducts = await MockDataStore.getProducts();
      setProducts(loadedProducts);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      setError('Please sign in to add items to cart');
      return;
    }

    try {
      await addToCart(productId);
      
      // Update the specific product's stock locally instead of reloading all products
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, stock: Math.max(0, product.stock - 1) }
            : product
        )
      );
      
      // Clear any previous errors
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading amazing products..." />;
  }

  return (
    <FormCard
      title="Premium Products Collection"
      subtitle="Discover our carefully curated selection of high-quality products designed to enhance your lifestyle"
    >
      <div data-testid="products-page" className="products-container">
        {error && (
          <div className="products-error">
            <ErrorMessage type="error" message={error} />
          </div>
        )}

        {!user && (
          <div className="products-signin-notice">
            <SignInNotice />
          </div>
        )}

        <div className="products-grid">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              user={user}
              index={index}
            />
          ))}
        </div>

        {products.length === 0 && !isLoading && (
          <div className="products-empty" data-testid="no-products">
            <div className="empty-icon">🛍️</div>
            <h3 className="empty-title">No Products Available</h3>
            <p className="empty-description">Check back later for new arrivals and exciting products.</p>
          </div>
        )}
      </div>
    </FormCard>
  );
};

export default ProductsPage;