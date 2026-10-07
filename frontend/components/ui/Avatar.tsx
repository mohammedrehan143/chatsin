import React from 'react';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }[size];

  const initials = alt
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses} rounded-full object-cover border border-slate-700/50 shadow-sm ${className}`}
        onError={(e) => {
          // Fallback if image fails to load
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-semibold flex items-center justify-center border border-indigo-400/30 shadow-sm select-none ${className}`}
    >
      {initials}
    </div>
  );
}
