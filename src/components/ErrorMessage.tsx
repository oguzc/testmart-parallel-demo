import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  icon?: string;
  type?: 'error' | 'warning' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  icon = "⚠️",
  type = 'error'
}) => {
  return (
    <div 
      className={`error-message error-message--${type}`}
      data-testid="error-message"
    >
      <div className="error-message__content">
        <span className="error-message__icon">{icon}</span>
        <span className="error-message__text">{message}</span>
      </div>
    </div>
  );
};

export default ErrorMessage;