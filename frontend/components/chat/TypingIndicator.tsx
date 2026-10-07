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
    <div className="flex items-center gap-2 px-6 py-1.5 text-xs text-[#00a884] bg-[#f0f2f5]/90 border-t border-[#e9edef] select-none">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce" />
      </div>
      <span className="font-medium">{text}</span>
    </div>
  );
}
