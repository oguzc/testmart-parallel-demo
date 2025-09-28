import React from 'react';
import './FormCard.css';

interface FormCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const FormCard: React.FC<FormCardProps> = ({ 
  title, 
  subtitle, 
  children, 
  className = '' 
}) => {
  return (
    <div className="form-card-container">
      <div className={`form-card-wrapper ${className}`}>
        <div className="form-card">
          <div className="form-card-header">
            <h2 className="form-card-title">
              {title}
            </h2>
            {subtitle && (
              <p className="form-card-subtitle">
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default FormCard;