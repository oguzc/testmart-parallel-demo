import React from 'react';
import type { CartItem as CartItemType } from '../types';
import Quantity from './Quantity';
import './CartItem.css';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div
      className="cart-item"
      data-testid={`cart-item-${item.productId}`}
    >
      {/* Column 1: Image */}
      <div className="cart-item-image">
        <img
          src={item.product?.image || 'https://via.placeholder.com/100x100?text=Product'}
          alt={item.product?.name || 'Product'}
          data-testid={`cart-item-image-${item.productId}`}
        />
      </div>

      {/* Column 2: Details (organized with quantity between prices) */}
      <div className="cart-item-details">
        <div className="cart-item-top-row">
          <span className="cart-item-name">
            {item.product?.name || 'Unknown Product'}
          </span>
        </div>
        <div className="cart-item-bottom-row">
          <span className="cart-item-price">
            ${item.product?.price || 0}
          </span>
          <div className="cart-item-quantity">
            <span className="cart-item-quantity-label">Qty:</span>
            <Quantity
              value={item.quantity}
              onChange={(newQuantity) => onUpdateQuantity(item.id, newQuantity)}
              id={`quantity-${item.id}`}
            />
          </div>
          <span className="cart-item-total">
            ${((item.product?.price || 0) * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Column 3: Full Height Delete Button */}
      <button
        onClick={() => onRemove(item.id)}
        className="cart-item-delete"
        data-testid={`remove-item-${item.productId}`}
      >
        Delete
      </button>
    </div>
  );
};

export default CartItem;