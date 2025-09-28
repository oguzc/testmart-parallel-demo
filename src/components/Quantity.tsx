import React from 'react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import './Quantity.css';

interface QuantityProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  id?: string;
}

const Quantity: React.FC<QuantityProps> = ({ 
  value, 
  onChange, 
  min = 1, 
  max = 99, 
  className = '',
  id 
}) => {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || min;
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className={`quantity-container ${className}`}>
      <button
        onClick={handleDecrease}
        disabled={value <= min}
        className="quantity-button"
      >
        <MinusIcon className="quantity-icon" />
      </button>
      
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={handleInputChange}
        className="quantity-input"
      />
      
      <button
        onClick={handleIncrease}
        disabled={value >= max}
        className="quantity-button"
      >
        <PlusIcon className="quantity-icon" />
      </button>
    </div>
  );
};

export default Quantity;