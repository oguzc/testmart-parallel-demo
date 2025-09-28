import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import FormCard from '../components/FormCard';
import Button from '../components/Button';
import Toast from '../components/Toast';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Load saved email if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('testmart_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic email validation
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);
      
      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('testmart_remember_email', email);
      } else {
        localStorage.removeItem('testmart_remember_email');
      }
      
      setToast({ type: 'success', message: 'Welcome back! Redirecting...' });
      
      // Delay navigation to show success message
      setTimeout(() => {
        navigate('/'); // Redirect to home page after successful login
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('demo@testmart.com');
    setPassword('demo123');
    setToast({ type: 'info', message: 'Demo credentials filled! Click Sign In to continue.' });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <FormCard 
        title="Welcome Back"
        subtitle="Sign in to your TestMart account and continue your shopping journey"
      >
        <div className="login-container" data-testid="login-page">
          {error && (
            <div className="login-error" data-testid="error-message">
              <div className="error-content">
                <svg className="error-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="error-text">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Input */}
            <div className="input-group">
              <div className={`input-container ${emailFocused ? 'input-container--focused' : ''} ${email ? 'input-container--filled' : ''}`}>
                <div className="input-icon">
                  <UserIcon className="icon" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  data-testid="email-input"
                  className="input-field"
                />
                <label htmlFor="email" className="input-label">
                  Email Address
                </label>
              </div>
            </div>

            {/* Password Input */}
            <div className="input-group">
              <div className={`input-container ${passwordFocused ? 'input-container--focused' : ''} ${password ? 'input-container--filled' : ''}`}>
                <div className="input-icon">
                  <LockClosedIcon className="icon" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  data-testid="password-input"
                  className="input-field input-field--password"
                />
                <label htmlFor="password" className="input-label">
                  Password
                </label>
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="password-toggle"
                  data-testid="password-toggle"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="password-icon" />
                  ) : (
                    <EyeIcon className="password-icon" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="remember-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-label">Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <div className="submit-section">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                className="submit-button"
                data-testid="login-button"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="submit-icon" />
                    Sign In to TestMart
                  </>
                )}
              </Button>
            </div>
          </form>
          {/* Divider */}
          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">or</span>
            <div className="divider-line"></div>
          </div>

          {/* Demo Credentials */}
          <div className="demo-section">
            <div className="demo-header">
              <span className="demo-icon">🎯</span>
              <div>
                <h4 className="demo-title">Try the Demo</h4>
                <p className="demo-subtitle">Experience TestMart with demo credentials</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="demo-button"
              data-testid="demo-credentials-button"
            >
              <SparklesIcon className="demo-button-icon" />
              Fill Demo Credentials
            </button>
            <div className="demo-info">
              <p className="demo-info-text">
                <strong>Email:</strong> demo@testmart.com<br/>
                <strong>Password:</strong> demo123
              </p>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="signup-section">
            <p className="signup-text">
              New to TestMart?
            </p>
            <Link
              to="/register"
              className="signup-link"
              data-testid="register-link"
            >
              Create your account
              <svg className="signup-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </FormCard>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default LoginPage;