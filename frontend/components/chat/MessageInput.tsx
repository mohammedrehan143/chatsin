'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SendHorizonal, Smile, Paperclip } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export function MessageInput() {
  const [content, setContent] = useState('');
  const { sendMessage, sendTyping } = useChat();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSendingRef = useRef(false);

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
    if (!trimmed || isSendingRef.current) return;

    isSendingRef.current = true;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTyping(false);

    setContent('');

    try {
      await sendMessage(trimmed);
    } finally {
      // Cooldown to prevent any rapid double execution
      setTimeout(() => {
        isSendingRef.current = false;
      }, 200);
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
    <div className="px-4 py-3 bg-white border-t border-[#e4e4e7] shrink-0">
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
          className="p-2 text-[#71717a] hover:text-[#09090b] hover:bg-[#f4f4f5] transition-colors rounded-full"
        >
          <Smile className="w-5 h-5" />
        </button>
        <button
          type="button"
          title="Attach"
          className="p-2 text-[#71717a] hover:text-[#09090b] hover:bg-[#f4f4f5] transition-colors rounded-full"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={content}
          onChange={handleTextChange}
          placeholder="Type a message..."
          maxLength={4000}
          className="flex-1 bg-[#f4f4f5] focus:bg-white border border-transparent focus:border-[#09090b] rounded-2xl px-4 py-2.5 text-sm text-[#09090b] placeholder-[#71717a] outline-none transition-all shadow-xs"
        />

        <button
          type="submit"
          disabled={!content.trim()}
          title="Send message"
          className={`p-2.5 rounded-full transition-all flex items-center justify-center shrink-0 cursor-pointer ${
            content.trim()
              ? 'bg-[#09090b] hover:bg-[#27272a] text-white shadow-md active:scale-95'
              : 'text-[#a1a1aa] bg-[#f4f4f5] opacity-60 cursor-not-allowed'
          }`}
        >
          <SendHorizonal className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
