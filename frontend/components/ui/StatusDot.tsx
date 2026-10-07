import React from 'react';

interface StatusDotProps {
  isOnline?: boolean;
  className?: string;
  showText?: boolean;
}

export function StatusDot({ isOnline = false, className = '', showText = false }: StatusDotProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 transition-colors duration-300 ${
          isOnline ? 'bg-emerald-500 shadow-emerald-500/50 shadow-sm' : 'bg-slate-500'
        }`}
      />
      {showText && (
        <span className="text-xs text-slate-400 font-medium">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
}
