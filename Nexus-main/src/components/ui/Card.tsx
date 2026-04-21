import React from 'react';

interface CardProps {
 children: React.ReactNode;
 className?: string;
 onClick?: () => void;
 hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  const hoverableClass = hoverable ? 'hover:scale-[1.01] hover:-translate-y-1 transition-all duration-500 cursor-pointer' : '';
  const clickableClass = onClick ? 'cursor-pointer active:scale-[0.98]' : '';
  
  return (
  <div 
  className={`glass-card rounded-[2rem] overflow-hidden ${hoverableClass} ${clickableClass} ${className}`}
  onClick={onClick}
  >
  {children}
  </div>
  );
};

interface CardHeaderProps {
 children: React.ReactNode;
 className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
 children,
 className = '',
}) => {
 return (
 <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
 {children}
 </div>
 );
};

interface CardBodyProps {
 children: React.ReactNode;
 className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({
 children,
 className = '',
}) => {
 return (
 <div className={`px-6 py-4 ${className}`}>
 {children}
 </div>
 );
};

interface CardFooterProps {
 children: React.ReactNode;
 className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
 children,
 className = '',
}) => {
 return (
 <div className={`px-6 py-4 border-t border-gray-100 ${className}`}>
 {children}
 </div>
 );
};