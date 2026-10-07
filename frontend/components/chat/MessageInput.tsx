'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { SendHorizonal, Smile, Paperclip } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export function MessageInput() {
  const [content, setContent] = useState('');
  const { sendMessage, sendTyping } = useChat();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);

    // Typing debounce
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
    <div className="px-4 py-2.5 bg-[#f0f2f5] border-t border-[#e9edef] shrink-0">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 max-w-5xl mx-auto"
      >
        <button
          type="button"
          title="Emojis"
          className="p-1.5 text-[#54656f] hover:text-[#111b21] transition-colors rounded-full"
        >
          <Smile className="w-5 h-5" />
        </button>
        <button
          type="button"
          title="Attach"
          className="p-1.5 text-[#54656f] hover:text-[#111b21] transition-colors rounded-full"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={content}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          maxLength={4000}
          className="flex-1 bg-white border-0 focus:ring-0 rounded-lg px-4 py-2.5 text-sm text-[#111b21] placeholder-[#8696a0] focus:outline-none transition-all shadow-xs"
        />

        <button
          type="submit"
          disabled={!content.trim()}
          title="Send message"
          className={`p-2.5 rounded-full transition-all flex items-center justify-center shrink-0 cursor-pointer ${
            content.trim()
              ? 'bg-[#00a884] hover:bg-[#008069] text-white shadow-sm'
              : 'text-[#8696a0] hover:text-[#54656f] opacity-50 cursor-not-allowed'
          }`}
        >
          <SendHorizonal className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
