import React from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: AvatarSize;
  className?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  className = '',
  status,
}) => {
  const [imageError, setImageError] = React.useState(false);

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getBackgroundColor = (name?: string) => {
    const colors = [
      'bg-primary-500',
      'bg-indigo-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-teal-500',
      'bg-cyan-500',
    ];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const sizeClasses: Record<AvatarSize, string> = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-xl',
    '2xl': 'h-24 w-24 text-2xl',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  const statusSizes: Record<AvatarSize, string> = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
    '2xl': 'h-5 w-5',
  };

  const showPlaceholder = !src || imageError;

  // Resolve source URL (prepend backend origin if it's a relative upload path)
  const backendOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '');
  const resolvedSrc = (src && src.startsWith('/uploads'))
    ? `${backendOrigin}${src}`
    : src;

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      {showPlaceholder ? (
        <div 
          className={`rounded-full flex items-center justify-center font-medium text-white ${getBackgroundColor(alt)} ${sizeClasses[size]}`}
          title={alt}
        >
          {getInitials(alt)}
        </div>
      ) : (
        <img
          src={resolvedSrc}
          alt={alt}
          className={`rounded-full object-cover shadow-sm ${sizeClasses[size].split(' ')[0]} ${sizeClasses[size].split(' ')[1]}`}
          onError={() => setImageError(true)}
        />
      )}
      
      {status && (
        <span 
          className={`absolute bottom-0 right-0 block rounded-full ${statusColors[status]} ${statusSizes[size]} transition-all duration-300 ${status === 'online' ? 'animate-pulse' : ''}`}
        />
      )}
    </div>
  );
};