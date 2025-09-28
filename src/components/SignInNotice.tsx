import React from 'react';
import { Link } from 'react-router-dom';
import './SignInNotice.css';

interface SignInNoticeProps {
  message?: string;
  linkText?: string;
  linkTo?: string;
}

const SignInNotice: React.FC<SignInNoticeProps> = ({ 
  message = "Sign in to add items to your cart and start shopping!",
  linkText = "Sign In",
  linkTo = "/login"
}) => {
  return (
    <div className="signin-notice" data-testid="signin-notice">
      <div className="signin-notice__content">
        <div className="signin-notice__info">
          <span className="signin-notice__icon">🔑</span>
          <p className="signin-notice__message">{message}</p>
        </div>
        <Link 
          to={linkTo} 
          className="signin-notice__link"
        >
          {linkText}
        </Link>
      </div>
    </div>
  );
};

export default SignInNotice;