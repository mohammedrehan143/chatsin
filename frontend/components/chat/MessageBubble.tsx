'use client';

import React from 'react';
import { Message } from '../../types';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const formattedTime = format(new Date(message.createdAt), 'h:mm a');

  return (
    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} my-1 animate-fade-in`}>
      <div
        className={`max-w-[82%] sm:max-w-[65%] px-4 py-2 text-sm break-words relative transition-all ${
          isOwn
            ? 'bg-[#09090b] text-white rounded-2xl rounded-tr-xs shadow-md'
            : 'bg-white text-[#09090b] rounded-2xl rounded-tl-xs border border-zinc-200/90 shadow-xs'
        }`}
      >
        <p className="leading-relaxed text-[13.5px] whitespace-pre-wrap">{message.content}</p>

        <div
          className={`flex items-center justify-end gap-1 mt-1 text-[10.5px] select-none float-right ml-3 -mb-0.5 ${
            isOwn ? 'text-zinc-400' : 'text-zinc-500'
          }`}
        >
          <span>{formattedTime}</span>

          {isOwn && (
            <span className="inline-flex items-center ml-0.5">
              {message.id.startsWith('temp-') ? (
                <Clock className="w-3 h-3 text-zinc-400 animate-pulse" />
              ) : message.status === 'READ' ? (
                <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
              ) : message.status === 'DELIVERED' ? (
                <CheckCheck className="w-3.5 h-3.5 text-zinc-400" />
              ) : (
                <Check className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
