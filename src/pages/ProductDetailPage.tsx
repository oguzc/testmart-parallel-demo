import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ApiDataStore } from '../data/ApiDataStore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import FormCard from '../components/FormCard';
import Quantity from '../components/Quantity';
import type { Product } from '../types';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (productId) {
      loadProduct(productId);
    }
  }, [productId]);

  const loadProduct = async (productId: string) => {
    try {
      setIsLoading(true);
      setError('');
      const products = await ApiDataStore.getProducts();
      const loadedProduct = products.find(p => p.id === productId);
      if (loadedProduct) {
        // Generate additional product images for demo
        const productWithImages = {
          ...loadedProduct,
          images: [
            loadedProduct.image || `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop&crop=center&q=80&auto=format`,
            `https://images.unsplash.com/photo-1560472355-536de3962603?w=600&h=600&fit=crop&crop=center&q=80&auto=format`,
            `https://images.unsplash.com/photo-1560472354-981537ff2348?w=600&h=600&fit=crop&crop=center&q=80&auto=format`,
          ]
        };
        setProduct(productWithImages);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError('Failed to load product');
      console.error('Error loading product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      setError('Please sign in to add items to cart');
      return;
    }

    if (!product) return;

    try {
      setIsAddingToCart(true);
      setError('');
      
      // Add multiple quantities if selected
      for (let i = 0; i < quantity; i++) {
        await addToCart(product.id);
      }
      
      // Update local product stock
      setProduct(prev => prev ? { ...prev, stock: Math.max(0, prev.stock - quantity) } : null);
      
      // Reset quantity after successful add
      setQuantity(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading product details..." />;
  }

  if (error && !product) {
    return (
      <FormCard title="Error" subtitle="Unable to load product">
        <div className="product-detail-error">
          <ErrorMessage type="error" message={error} />
          <Link to="/products" className="back-to-products-btn">
            <ArrowLeftIcon className="back-icon" />
            Back to Products
          </Link>
        </div>
      </FormCard>
    );
  }

  if (!product) {
    return (
      <FormCard title="Product Not Found" subtitle="The requested product could not be found">
        <div className="product-not-found">
          <div className="not-found-icon">🔍</div>
          <h3 className="not-found-title">Product Not Found</h3>
          <p className="not-found-description">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/products" className="back-to-products-btn">
            <ArrowLeftIcon className="back-icon" />
            Back to Products
          </Link>
        </div>
      </FormCard>
    );
  }

  return (
    <FormCard
      title={product.name}
      subtitle={`Premium quality • ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}`}
    >
      <div className="product-detail-container" data-testid="product-detail">
        {/* Back Navigation */}
        <div className="product-detail-nav">
          <button 
            onClick={() => navigate('/products')}
            className="back-button"
            data-testid="back-button"
          >
            <ArrowLeftIcon className="back-icon" />
            Back to Products
          </button>
        </div>

        {error && (
          <div className="product-detail-error">
            <ErrorMessage type="error" message={error} />
          </div>
        )}

        <div className="product-detail-grid">
          {/* Product Images */}
          <div className="product-images-section">
            <div className="main-image-container">
              <img 
                src={product.images?.[selectedImageIndex] || product.image || `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop&crop=center&q=80&auto=format`}
                alt={product.name}
                className="main-image"
                data-testid="product-main-image"
              />
              <button 
                onClick={toggleFavorite}
                className={`favorite-button ${isFavorite ? 'favorite-button--active' : ''}`}
                data-testid="favorite-button"
              >
                {isFavorite ? (
                  <HeartSolid className="favorite-icon" />
                ) : (
                  <HeartIcon className="favorite-icon" />
                )}
              </button>
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="thumbnail-images">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`thumbnail-button ${selectedImageIndex === index ? 'thumbnail-button--active' : ''}`}
                    data-testid={`thumbnail-${index}`}
                  >
                    <img src={image} alt={`${product.name} view ${index + 1}`} className="thumbnail-image" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            <div className="product-price-section">
              <span className="product-price" data-testid="product-price">
                ${product.price.toFixed(2)}
              </span>
              <div className="product-stock-badge">
                {product.stock > 0 ? (
                  <span className="stock-in">✅ In Stock ({product.stock} available)</span>
                ) : (
                  <span className="stock-out">❌ Out of Stock</span>
                )}
              </div>
            </div>

            <div className="product-description-section">
              <h3 className="description-title">Description</h3>
              <p className="product-description" data-testid="product-description">
                {product.description}
              </p>
              
              {/* Demo features */}
              <div className="product-features">
                <h4 className="features-title">Key Features</h4>
                <ul className="features-list">
                  <li>✨ Premium quality materials</li>
                  <li>🚚 Free shipping on orders over $50</li>
                  <li>🔒 30-day money-back guarantee</li>
                  <li>⚡ Same-day dispatch</li>
                </ul>
              </div>
            </div>

            {/* Add to Cart Section */}
            {user ? (
              <div className="add-to-cart-section">
                <div className="quantity-section">
                  <label className="quantity-label">Quantity:</label>
                  <Quantity
                    value={quantity}
                    onChange={setQuantity}
                    max={product.stock}
                    id={`quantity-${product.id}`}
                  />
                </div>
                
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isAddingToCart}
                  className="add-to-cart-button"
                  data-testid="add-to-cart-button"
                >
                  <ShoppingCartIcon className="cart-icon" />
                  {isAddingToCart ? 'Adding...' : `Add ${quantity} to Cart`}
                </button>
                
                <div className="total-price">
                  Total: <span className="total-amount">${(product.price * quantity).toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="signin-prompt">
                <p>Please sign in to add items to your cart</p>
                <Link to="/login" className="signin-link">Sign In</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </FormCard>
  );
};

export default ProductDetailPage;