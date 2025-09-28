import React from 'react';
import { Link } from 'react-router-dom';
import FormCard from './FormCard';

interface EmptyCartProps {
  title: string;
  subtitle: string;
  linkTo: string;
  linkText: string;
  testId?: string;
}

const EmptyCart: React.FC<EmptyCartProps> = ({ 
  title, 
  subtitle, 
  linkTo, 
  linkText,
  testId = "cart-page"
}) => {
  return (
    <FormCard 
      title={title}
      subtitle={subtitle}
    >
      <div className="text-center" data-testid={testId}>
        <Link
          to={linkTo}
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          style={{ borderRadius: '1rem' }}
          data-testid={linkTo === '/login' ? 'login-prompt' : 'continue-shopping-button'}
        >
          {linkText}
        </Link>
      </div>
    </FormCard>
  );
};

export default EmptyCart;