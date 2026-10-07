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
    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} my-1`}>
      <div
        className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm text-sm break-words relative transition-all ${
          isOwn
            ? 'bg-indigo-600 text-white rounded-br-xs'
            : 'bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/50'
        }`}
      >
        <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>

        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${isOwn ? 'text-indigo-200' : 'text-slate-400'}`}>
          <span>{formattedTime}</span>

          {isOwn && (
            <span className="inline-flex items-center ml-0.5">
              {message.id.startsWith('temp-') ? (
                <Clock className="w-3 h-3 text-indigo-300 animate-pulse" />
              ) : message.status === 'READ' ? (
                <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
              ) : message.status === 'DELIVERED' ? (
                <CheckCheck className="w-3.5 h-3.5 text-indigo-300" />
              ) : (
                <Check className="w-3.5 h-3.5 text-indigo-300" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
