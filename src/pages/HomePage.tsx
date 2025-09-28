import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Hero from '../components/Hero';
import FullWidthSection from '../components/FullWidthSection';
import Button from '../components/Button';
import './HomePage.css';

const HomePage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { message?: string; orderId?: string } | null;

  return (
    <div data-testid="home-page">
      <div className="home-notifications">
        {state?.message && (
          <div className="success-notification" data-testid="success-message">
            <div className="success-icon">✅</div>
            <div className="success-content">
              <div className="success-message">{state.message}</div>
              {state.orderId && (
                <div className="success-order-id">Order ID: {state.orderId}</div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Hero Component - Full width */}
      <Hero user={user} />
      
      {/* Features Section - Full width background */}
      <FullWidthSection bgColor="gray" testId="features-section">
        <div className="features-grid">
          <div className="feature-card" data-testid="feature-quality">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">✨</span>
            </div>
            <h3 className="feature-title">Premium Quality</h3>
            <p className="feature-description">
              Carefully curated selection of high-quality items that exceed expectations
            </p>
          </div>
          
          <div className="feature-card feature-card--delayed-1" data-testid="feature-shipping">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">🚚</span>
            </div>
            <h3 className="feature-title">Lightning Fast</h3>
            <p className="feature-description">
              Quick and reliable delivery to get your products when you need them
            </p>
          </div>
          
          <div className="feature-card feature-card--delayed-2" data-testid="feature-support">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">💬</span>
            </div>
            <h3 className="feature-title">24/7 Support</h3>
            <p className="feature-description">
              Our customer service team is always here to help with any questions
            </p>
          </div>
        </div>
      </FullWidthSection>

      {/* Demo Section - Full width background */}
      <FullWidthSection bgColor="green" testId="demo-section">
        <div className="demo-section">
          <div className="demo-container">
            <div className="demo-badge">
              🎭 Playwright Powered
            </div>
            <h2 className="demo-title">
              Parallel Testing Architecture Demo
            </h2>
            <p className="demo-description">
              Experience a real e-commerce application built with battle-tested parallel E2E testing patterns. 
              Every interaction you make can be reliably tested across multiple workers without conflicts.
            </p>
            <div className="demo-actions">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/products')}
                data-testid="explore-products-button"
                className="demo-primary-button"
              >
                🛍️ Explore Products
                <svg className="demo-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
              <a
                href="https://github.com/your-repo/testmart-parallel-demo"
                className="demo-secondary-button"
              >
                📖 View Code
              </a>
            </div>
          </div>
        </div>
      </FullWidthSection>
    </div>
  );
};

export default HomePage;