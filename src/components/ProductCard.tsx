import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';
import type { Product, User } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  user: User | null;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  user,
  index
}) => {
  return (
    <div
      className="product-card group"
      style={{ animationDelay: `${index * 0.1}s` }}
      data-testid="product-card"
      data-product-id={product.id}
    >
      <Link to={`/product/${product.id}`} className="product-card__link">
        <div className="product-card__image-container">
          <img
            src={product.image || `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center&q=80&auto=format`}
            alt={product.name}
            className="product-card__image"
            data-testid={`product-image-${product.id}`}
          />
          {product.stock <= 5 && product.stock > 0 && (
            <div className="product-card__stock-badge">
              Only {product.stock} left!
            </div>
          )}
        </div>
        
        <div className="product-card__content">
          <h3 
            className="product-card__title"
            data-testid={`product-name-${product.id}`}
          >
            {product.name}
          </h3>
        </div>
      </Link>
      
      <div className="product-card__content">
        
        <p 
          className="product-card__description"
          data-testid={`product-description-${product.id}`}
        >
          {product.description}
        </p>
        
        <div className="product-card__price-stock">
          <span 
            className="product-card__price"
            data-testid={`product-price-${product.id}`}
          >
            ${product.price}
          </span>
          
          <span 
            className={`product-card__stock ${
              product.stock > 0 ? 'product-card__stock--in' : 'product-card__stock--out'
            }`}
            data-testid={`product-stock-${product.id}`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
        
        <button
          onClick={() => onAddToCart(product.id)}
          disabled={!user || product.stock <= 0}
          className={`product-card__button ${
            !user || product.stock <= 0
              ? 'product-card__button--disabled'
              : 'product-card__button--primary'
          }`}
          data-testid={`add-to-cart-${product.id}`}
        >
          {!user 
            ? '🔒 Sign in to purchase' 
            : product.stock <= 0 
            ? '❌ Out of stock' 
            : '🛒 Add to Cart'
          }
        </button>
      </div>
    </div>
  );
};

export default ProductCard;