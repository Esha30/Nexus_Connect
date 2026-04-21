import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
 label?: string | React.ReactNode;
 error?: string;
 helperText?: string;
 startAdornment?: React.ReactNode;
 endAdornment?: React.ReactNode;
 fullWidth?: boolean;
 wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
 label,
 error,
 helperText,
 startAdornment,
 endAdornment,
 fullWidth = false,
 className = '',
 wrapperClassName = '',
 ...props
}, ref) => {
 
 const widthClass = fullWidth ? 'w-full' : '';
 const errorClass = error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500';
 
 const inputBaseClass = `block w-full rounded-lg shadow-sm focus:ring-1 sm:text-sm py-2.5 px-3 disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed ${errorClass}`;
 const adornmentClass = startAdornment ? 'pl-10' : '';
 
 return (
 <div className={`${widthClass} ${className} ${wrapperClassName}`}>
 {label && (
 <label className="block text-sm font-medium text-gray-700 mb-1.5">
 {label}
 </label>
 )}
 
 <div className="relative">
 {startAdornment && (
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
 {startAdornment}
 </div>
 )}
 
 <input
 ref={ref}
 className={`${inputBaseClass} ${adornmentClass}`}
 {...props}
 />
 
 {endAdornment && (
 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
 {endAdornment}
 </div>
 )}
 </div>
 
 {(error || helperText) && (
 <p className={`mt-1.5 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
 {error || helperText}
 </p>
 )}
 </div>
 );
});

Input.displayName = 'Input';