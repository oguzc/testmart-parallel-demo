import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ApiDataStore } from '../data/ApiDataStore';
import FormCard from '../components/FormCard';
import type { Order } from '../types';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    zipCode: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const { items, getTotal, clearCart, getItemCount } = useCart();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (items.length === 0) {
        throw new Error('Cart is empty');
      }

      // Simulate order processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create order
      const order: Order = {
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        items: items.map(item => ({ ...item })),
        total: getTotal(),
        status: 'completed',
        createdAt: new Date().toISOString(),
        shippingAddress
      };

      await ApiDataStore.createOrder(order);
      await clearCart();

      // Redirect to order confirmation page
      navigate('/order-confirmation', { 
        replace: true,
        state: { 
          order: order
        } 
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <FormCard
        title="Checkout"
        subtitle="Please sign in to complete your order"
      >
        <div data-testid="checkout-page" className="checkout-signin-notice">
          <p>You need to be signed in to proceed with checkout.</p>
        </div>
      </FormCard>
    );
  }

  if (items.length === 0) {
    return (
      <FormCard
        title="Checkout"
        subtitle="Your cart is empty"
      >
        <div data-testid="checkout-page" className="checkout-empty-notice">
          <p>Add some items to your cart before proceeding to checkout.</p>
        </div>
      </FormCard>
    );
  }

  return (
    <FormCard
      title="Checkout"
      subtitle={`Complete your order (${getItemCount()} items - $${getTotal().toFixed(2)})`}
    >
      <div data-testid="checkout-page" className="checkout-container">
        {error && (
          <div className="checkout-error" data-testid="error-message">
            {error}
          </div>
        )}

        <div className="checkout-grid">
          {/* Order Summary */}
          <div className="checkout-summary">
            <h2 className="checkout-section-title" data-testid="order-summary-title">
              Order Summary
            </h2>
            
            <div className="checkout-items">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="checkout-item"
                  data-testid={`order-item-${item.productId}`}
                >
                  <div className="checkout-item-details">
                    <p className="checkout-item-name">{item.product?.name || 'Unknown Product'}</p>
                    <p className="checkout-item-quantity">Qty: {item.quantity}</p>
                  </div>
                  <p className="checkout-item-price">
                    ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="checkout-total-section">
              <div className="checkout-total">
                <span>Total:</span>
                <span data-testid="checkout-total">${getTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Form */}
          <div className="checkout-form-section">
            <h2 className="checkout-section-title" data-testid="shipping-title">
              Shipping Address
            </h2>
            
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="checkout-input-group">
                <label htmlFor="street" className="checkout-label">
                  Street Address
                </label>
                <input
                  id="street"
                  type="text"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                  required
                  className="checkout-input"
                  placeholder="123 Main Street"
                  data-testid="address-input"
                />
              </div>

              <div className="checkout-input-group">
                <label htmlFor="city" className="checkout-label">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                  required
                  className="checkout-input"
                  placeholder="New York"
                  data-testid="city-input"
                />
              </div>

              <div className="checkout-input-group">
                <label htmlFor="zipCode" className="checkout-label">
                  ZIP Code
                </label>
                <input
                  id="zipCode"
                  type="text"
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                  required
                  className="checkout-input"
                  placeholder="10001"
                  data-testid="zip-input"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="checkout-submit-btn"
                data-testid="complete-order"
              >
                {isProcessing ? 'Processing Order...' : 'Complete Order'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </FormCard>
  );
};

export default CheckoutPage;