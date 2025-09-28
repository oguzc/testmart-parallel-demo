import React from 'react';
import './FullWidthSection.css';

interface FullWidthSectionProps {
  children: React.ReactNode;
  className?: string;
  bgColor?: 'gray' | 'orange' | 'blue' | 'green';
  testId?: string;
}

const FullWidthSection: React.FC<FullWidthSectionProps> = ({ 
  children, 
  className = '',
  bgColor = 'gray',
  testId 
}) => {
  const sectionClasses = [
    'full-width-section',
    `full-width-section--${bgColor}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <section 
      className={sectionClasses}
      data-testid={testId}
    >
      <div className="full-width-section__container">
        {children}
      </div>
    </section>
  );
};

export default FullWidthSection;