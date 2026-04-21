import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
 children: React.ReactNode;
 variant?: BadgeVariant;
 size?: BadgeSize;
 className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
 children,
 variant = 'default',
 size = 'sm',
 className = '',
}) => {
 const baseStyles = 'inline-flex items-center font-medium rounded-full';
 
 const sizeStyles = {
 sm: 'text-xs px-2.5 py-0.5',
 md: 'text-sm px-3 py-1',
 };
 
 const variantStyles = {
 default: 'bg-gray-100 text-gray-700',
 primary: 'bg-primary-50 text-primary-700',
 secondary: 'bg-gray-100 text-gray-600',
 success: 'bg-green-50 text-green-700',
 warning: 'bg-yellow-50 text-yellow-700',
 error: 'bg-red-50 text-red-700',
 };

 return (
 <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
 {children}
 </span>
 );
};