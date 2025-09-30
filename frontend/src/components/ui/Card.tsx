import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = true }) => {
  return (
    <div className={`glass-card ${hover ? 'hover:transform hover:scale-105' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;