import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  children, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-4';
  
  const variantClasses = {
    primary: 'gradient-primary text-white hover:shadow-lg hover:scale-105 focus:ring-primary-500/20',
    secondary: 'gradient-secondary text-white hover:shadow-lg hover:scale-105 focus:ring-secondary-500/20',
    outline: 'border-2 border-secondary-300 text-secondary-700 hover:bg-secondary-50 focus:ring-secondary-500/20',
    danger: 'bg-gradient-to-r from-danger-500 to-danger-600 text-white hover:shadow-lg hover:scale-105 focus:ring-danger-500/20',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500/20',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
      )}
      {children}
    </button>
  );
};

export default Button;