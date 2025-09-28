import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import FormCard from '../components/FormCard';
import type { Order } from '../types';
import './OrderConfirmationPage.css';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Get order data from navigation state
    if (location.state?.order) {
      setOrder(location.state.order);
    } else {
      // If no order data, redirect to home
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  if (!order) {
    return (
      <FormCard
        title="Loading..."
        subtitle="Please wait while we load your order confirmation"
      >
        <div className="order-loading">
          <div className="loading-spinner"></div>
        </div>
      </FormCard>
    );
  }

  return (
    <FormCard
      title="Order Confirmed!"
      subtitle={`Thank you for your purchase - Order #${order.id.split('-').pop()?.toUpperCase()}`}
    >
      <div className="order-confirmation" data-testid="order-confirmation">
        {/* Success Icon */}
        <div className="order-success-header">
          <CheckCircleIcon className="order-success-icon" />
          <h2 className="order-success-title">Your order has been placed successfully!</h2>
          <p className="order-success-subtitle">
            We've sent a confirmation email with your order details.
          </p>
        </div>

        {/* Order Details */}
        <div className="order-details-grid">
          {/* Order Summary */}
          <div className="order-summary-section">
            <h3 className="order-section-title">Order Summary</h3>
            <div className="order-items">
              {order.items.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="order-item-details">
                    <span className="order-item-name">{item.product?.name || 'Unknown Product'}</span>
                    <span className="order-item-quantity">Qty: {item.quantity}</span>
                  </div>
                  <span className="order-item-price">
                    ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="order-total-section">
              <div className="order-total">
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="order-shipping-section">
            <h3 className="order-section-title">Shipping Information</h3>
            <div className="order-shipping-details">
              <div className="shipping-address">
                <h4>Delivery Address:</h4>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.zipCode}</p>
              </div>
              <div className="shipping-estimate">
                <h4>Estimated Delivery:</h4>
                <p>3-5 business days</p>
              </div>
              <div className="order-status">
                <h4>Order Status:</h4>
                <span className="status-badge">{order.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="order-actions">
          <Link to="/products" className="continue-shopping-btn">
            Continue Shopping
          </Link>
          <Link to="/" className="home-btn">
            Back to Home
          </Link>
        </div>
      </div>
    </FormCard>
  );
};

export default OrderConfirmationPage;