import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import './CartSummary.css';

interface CartSummaryProps {
  total: number;
  itemCount: number;
}

const CartSummary: React.FC<CartSummaryProps> = ({ total }) => {
  const navigate = useNavigate();
  const isEligibleForFreeShipping = total >= 50;
  
  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };
  
  return (
    <div className="cart-summary">
      <div className="cart-summary-header">
        <div className="cart-summary-shipping">
          <p className="cart-summary-shipping-text">Free shipping on orders over $50</p>
          {isEligibleForFreeShipping ? (
            <p className="cart-summary-shipping-eligible">✓ Eligible for free shipping</p>
          ) : (
            <p className="cart-summary-shipping-needed">
              Add ${(50 - total).toFixed(2)} more for free shipping
            </p>
          )}
        </div>
        <div className="cart-summary-total">
          <p className="cart-summary-total-label">Cart Total</p>
          <p 
            className="cart-summary-total-amount"
            data-testid="cart-total"
          >
            ${total.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="cart-summary-buttons">
        <Button
          onClick={handleContinueShopping}
          variant="secondary"
          size="lg"
          className="cart-summary-button"
          data-testid="continue-shopping-button"
        >
          Continue Shopping
        </Button>
        <Button
          onClick={handleProceedToCheckout}
          variant="primary"
          size="lg"
          className="cart-summary-button"
          data-testid="checkout-button"
        >
          Proceed to Checkout →
        </Button>
      </div>
    </div>
  );
};

export default CartSummary;