import React from 'react';

interface TypingIndicatorProps {
  usernames: string[];
}

export function TypingIndicator({ usernames }: TypingIndicatorProps) {
  if (usernames.length === 0) return null;

  const text =
    usernames.length === 1
      ? `${usernames[0]} is typing...`
      : `${usernames.slice(0, 2).join(', ')} are typing...`;

  return (
    <div className="flex items-center gap-2 px-6 py-2 text-xs text-[#09090b] bg-white/95 border-t border-[#e4e4e7] select-none animate-fade-in">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-[#09090b] rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 bg-[#09090b] rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 bg-[#09090b] rounded-full animate-bounce" />
      </div>
      <span className="font-semibold tracking-tight">{text}</span>
    </div>
  );
}
