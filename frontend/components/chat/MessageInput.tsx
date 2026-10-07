'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { SendHorizonal } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export function MessageInput() {
  const [content, setContent] = useState('');
  const { sendMessage, sendTyping } = useChat();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);

    // Typing debounce logic
    sendTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 1500);
  };

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTyping(false);

    setContent('');
    await sendMessage(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="p-3 bg-slate-900 border-t border-slate-800">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 max-w-4xl mx-auto"
      >
        <input
          type="text"
          value={content}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          maxLength={4000}
          className="flex-1 bg-slate-800/80 hover:bg-slate-800 focus:bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all shadow-inner"
        />
        <button
          type="submit"
          disabled={!content.trim()}
          className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          <SendHorizonal className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
