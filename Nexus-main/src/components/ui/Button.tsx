import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'link' | 'success' | 'warning' | 'error';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 variant?: ButtonVariant;
 size?: ButtonSize;
 fullWidth?: boolean;
 isLoading?: boolean;
 leftIcon?: React.ReactNode;
 rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
 variant = 'primary',
 size = 'md',
 fullWidth = false,
 isLoading = false,
 leftIcon,
 rightIcon,
 children,
 className = '',
 disabled,
 ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none tracking-tight';
  
  const sizeStyles = {
    xs: 'text-xs px-3 py-1.5',
    sm: 'text-sm px-4 py-2',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-6 py-3',
    xl: 'text-lg px-8 py-4',
  };
  
  const variantStyles = {
    primary: 'bg-primary-900 text-white hover:bg-black shadow-[0_4px_12px_rgba(15,23,42,0.15)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.25)]',
    secondary: 'bg-primary-100 text-primary-900 hover:bg-primary-200 shadow-sm',
    accent: 'bg-brand-600 text-white hover:bg-brand-700 shadow-[0_4px_12px_rgba(2,132,199,0.15)] hover:shadow-[0_8px_20px_rgba(2,132,199,0.25)]',
    outline: 'border-2 border-primary-200 bg-transparent text-primary-900 hover:bg-white hover:border-primary-900',
    ghost: 'bg-transparent hover:bg-primary-50 text-primary-700',
    link: 'bg-transparent text-brand-600 hover:text-brand-700 hover:underline p-0',
    success: 'bg-success-500 text-white hover:bg-success-600 shadow-[0_4px_12px_rgba(16,185,129,0.15)]',
    warning: 'bg-warning-500 text-white hover:bg-warning-600',
    error: 'bg-error-500 text-white hover:bg-error-600',
  };
 
 const loadingClass = isLoading ? 'opacity-70 cursor-not-allowed' : '';
 const widthClass = fullWidth ? 'w-full' : '';
 const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
 
 const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthClass} ${loadingClass} ${disabledClass} ${className}`;
 
 return (
 <button
 className={combinedClassName}
 disabled={disabled || isLoading}
 {...props}
 >
 {isLoading && (
 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
 </svg>
 )}
 
 {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
 {children}
 {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
 </button>
 );
};