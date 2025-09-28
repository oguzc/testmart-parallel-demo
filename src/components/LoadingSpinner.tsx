import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="loading-spinner" data-testid="loading-spinner">
      <div className="loading-spinner__animation">
        <div className="loading-spinner__ring loading-spinner__ring--bg"></div>
        <div className="loading-spinner__ring loading-spinner__ring--primary"></div>
      </div>
      <p className="loading-spinner__message">{message}</p>
    </div>
  );
};

export default LoadingSpinner;