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
    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} my-0.5`}>
      <div
        className={`max-w-[80%] sm:max-w-[65%] rounded-lg px-3 py-1.5 shadow-xs text-sm break-words relative transition-all ${
          isOwn
            ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
            : 'bg-white text-[#111b21] rounded-tl-none border border-[#e9edef]/80'
        }`}
      >
        <p className="leading-relaxed text-[13.5px] whitespace-pre-wrap">{message.content}</p>

        <div className="flex items-center justify-end gap-1 mt-0.5 text-[10.5px] text-[#667781] select-none float-right ml-2 -mb-0.5">
          <span>{formattedTime}</span>

          {isOwn && (
            <span className="inline-flex items-center ml-0.5">
              {message.id.startsWith('temp-') ? (
                <Clock className="w-3 h-3 text-[#8696a0] animate-pulse" />
              ) : message.status === 'READ' ? (
                <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
              ) : message.status === 'DELIVERED' ? (
                <CheckCheck className="w-3.5 h-3.5 text-[#8696a0]" />
              ) : (
                <Check className="w-3.5 h-3.5 text-[#8696a0]" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
