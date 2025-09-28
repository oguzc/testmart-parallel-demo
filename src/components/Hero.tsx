import React from 'react';
import { Link } from 'react-router-dom';
import FullWidthSection from './FullWidthSection';
import './Hero.css';

interface HeroProps {
  user?: {
    name: string;
  } | null;
}

const Hero: React.FC<HeroProps> = ({ user }) => {
  return (
    <FullWidthSection bgColor="blue" testId="hero-section">
      <div className="hero__content">
        <div className="hero__badge">
          🚀 Parallel Testing Demo
        </div>
        
        <h1 className="hero__title" data-testid="hero-title">
          Welcome to <span className="hero__brand">TestMart</span>
        </h1>
        
        <p className="hero__subtitle" data-testid="hero-subtitle">
          Experience the future of e-commerce while exploring battle-tested patterns for parallel E2E testing
        </p>
        
        <div className="hero__actions">
          {user ? (
            <>
              <p className="hero__greeting" data-testid="user-greeting">
                👋 Hello {user.name}! Ready to explore our amazing products?
              </p>
              <Link
                to="/products"
                className="hero__cta-button"
                data-testid="shop-now-button"
              >
                🛍️ Start Shopping
                <svg className="hero__cta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </>
          ) : (
            <>
              <p className="hero__auth-message">
                Join thousands of happy customers and discover amazing products!
              </p>
              <div className="hero__auth-actions">
                <Link to="/login" className="hero__auth-button hero__auth-button--secondary">
                  Sign In
                </Link>
                <Link to="/register" className="hero__auth-button hero__auth-button--primary">
                  Get Started
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </FullWidthSection>
  );
};

export default Hero;