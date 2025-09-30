import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon, EnvelopeIcon, CheckCircleIcon, XCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import FormCard from '../components/FormCard';
import Button from '../components/Button';
import Toast from '../components/Toast';
import './RegisterPage.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength validation
  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength({ score: 0, feedback: '' });
      return;
    }
    
    let score = 0;
    let feedback = '';
    
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    
    switch (score) {
      case 0:
      case 1:
        feedback = 'Weak - Add more characters and complexity';
        break;
      case 2:
        feedback = 'Fair - Add uppercase, numbers, or symbols';
        break;
      case 3:
        feedback = 'Good - Consider adding symbols';
        break;
      case 4:
      case 5:
        feedback = 'Strong - Great password!';
        break;
    }
    
    setPasswordStrength({ score, feedback });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Enhanced validation
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      setError('Please accept the Terms of Service to continue');
      return;
    }

    setIsLoading(true);

    try {
      await register(name.trim(), email, password);
      
      setToast({ type: 'success', message: 'Account created successfully! Welcome to TestMart!' });
      
      // Delay navigation to show success message
      setTimeout(() => {
        navigate('/'); // Redirect to home page after successful registration
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const fillDemoData = () => {
    setName('Demo User');
    setEmail('demo@testmart.com');
    setPassword('Demo123!');
    setConfirmPassword('Demo123!');
    setAcceptTerms(true);
    setToast({ type: 'info', message: 'Demo registration data filled! Click Create Account to continue.' });
  };

  return (
    <>
      <FormCard 
        title="Join TestMart"
        subtitle="Create your account and discover amazing products with exclusive member benefits"
      >
        <div className="register-container" data-testid="register-page">
          {error && (
            <div className="register-error" data-testid="error-message">
              <div className="error-content">
                <XCircleIcon className="error-icon" />
                <span className="error-text">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            {/* Name Input */}
            <div className="input-group">
              <div className={`input-container ${nameFocused ? 'input-container--focused' : ''} ${name ? 'input-container--filled' : ''}`}>
                <div className="input-icon">
                  <UserIcon className="icon" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  required
                  data-testid="name-input"
                  className="input-field"
                />
                <label htmlFor="name" className="input-label">
                  Full Name
                </label>
              </div>
            </div>

            {/* Email Input */}
            <div className="input-group">
              <div className={`input-container ${emailFocused ? 'input-container--focused' : ''} ${email ? 'input-container--filled' : ''}`}>
                <div className="input-icon">
                  <EnvelopeIcon className="icon" />
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
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className={`strength-fill strength-fill--${passwordStrength.score}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <p className={`strength-text strength-text--${passwordStrength.score}`}>
                    {passwordStrength.feedback}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="input-group">
              <div className={`input-container ${confirmPasswordFocused ? 'input-container--focused' : ''} ${confirmPassword ? 'input-container--filled' : ''}`}>
                <div className="input-icon">
                  <LockClosedIcon className="icon" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  required
                  data-testid="confirm-password-input"
                  className="input-field input-field--password"
                />
                <label htmlFor="confirmPassword" className="input-label">
                  Confirm Password
                </label>
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="password-toggle"
                  data-testid="confirm-password-toggle"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="password-icon" />
                  ) : (
                    <EyeIcon className="password-icon" />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="password-match">
                  {password === confirmPassword ? (
                    <div className="match-indicator match-indicator--success">
                      <CheckCircleIcon className="match-icon" />
                      <span>Passwords match</span>
                    </div>
                  ) : (
                    <div className="match-indicator match-indicator--error">
                      <XCircleIcon className="match-icon" />
                      <span>Passwords do not match</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="terms-section">
              <label className="terms-checkbox" htmlFor="terms-checkbox">
                <input
                  type="checkbox"
                  id="terms-checkbox"
                  name="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="checkbox-input"
                  data-testid="terms-checkbox"
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-label">
                  I agree to the{' '}
                  <Link to="/terms" className="terms-link">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="terms-link">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="submit-section">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading || !acceptTerms}
                className="submit-button"
                data-testid="register-button"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="submit-icon" />
                    Create My Account
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

          {/* Demo Section */}
          <div className="demo-section">
            <div className="demo-header">
              <span className="demo-icon">🚀</span>
              <div>
                <h4 className="demo-title">Quick Demo Registration</h4>
                <p className="demo-subtitle">Try TestMart instantly with sample data</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fillDemoData}
              className="demo-button"
              data-testid="demo-fill-button"
            >
              <SparklesIcon className="demo-button-icon" />
              Fill Demo Registration
            </button>
            <div className="demo-info">
              <p className="demo-info-text">
                Creates a demo account with sample data for testing purposes.
              </p>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="signin-section">
            <p className="signin-text">
              Already a TestMart member?
            </p>
            <Link
              to="/login"
              className="signin-link"
              data-testid="login-link"
            >
              Sign in to your account
              <svg className="signin-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default RegisterPage;