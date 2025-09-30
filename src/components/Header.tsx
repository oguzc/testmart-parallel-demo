import { Link, useLocation } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const location = useLocation();
  const cartItemCount = getItemCount();

  return (
    <header className="header" data-testid="header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <Link 
            to="/" 
            className="header-logo"
            data-testid="logo"
          >
            <span className="header-logo-icon">🛒</span>
            <span className="header-logo-text">TestMart</span>
          </Link>

          {/* Navigation */}
          <nav className="header-nav">
            <Link
              to="/"
              className={`header-nav-link ${location.pathname === '/' ? 'active' : ''}`}
              data-testid="nav-home"
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`header-nav-link ${location.pathname === '/products' ? 'active' : ''}`}
              data-testid="nav-products"
            >
              Products
            </Link>
          </nav>

          {/* Right side items */}
          <div className="header-actions">
            {/* Auth */}
            {user ? (
              <div className="header-user">
                <span className="header-user-name" data-testid="user-name">
                  {user.name}
                </span>
                <button 
                  onClick={logout}
                  className="header-logout-btn"
                  data-testid="logout-button"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="header-auth">
                <Link 
                  to="/login"
                  className="header-auth-link"
                  data-testid="sign-in-button"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register"
                  className="header-auth-link header-auth-link--primary"
                  data-testid="sign-up-button"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Cart - moved to rightmost */}
            <div className="header-cart">
              <Link 
                to="/cart" 
                className="header-cart-link"
                data-testid="cart-button"
              >
                <ShoppingCartIcon className="header-cart-icon" />
                {cartItemCount > 0 && (
                  <span className="header-cart-badge" data-testid="cart-count">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;