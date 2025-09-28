import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  helperText, 
  className = '', 
  id,
  ...props 
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="mb-8">
      <label 
        htmlFor={inputId} 
        className="block text-xl font-semibold text-gray-900 mb-4"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`
          w-full px-6 py-6 text-2xl font-medium
          border-2 border-gray-300 rounded-2xl
          focus:border-blue-500 focus:ring-0 focus:outline-none
          transition-all duration-200
          placeholder-gray-400 bg-white
          hover:border-gray-400
          ${error ? 'border-red-400 focus:border-red-500' : ''}
          ${className}
        `.trim()}
        style={{
          minHeight: '4rem'
        }}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;