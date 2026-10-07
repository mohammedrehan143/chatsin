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
    <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-indigo-400 bg-slate-900/60 backdrop-blur select-none">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
      </div>
      <span>{text}</span>
    </div>
  );
}
