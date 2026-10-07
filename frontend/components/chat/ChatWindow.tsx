'use client';

import React, { useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { ArrowLeft, UserCircle2, ShieldCheck, MessageSquareText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatWindowProps {
  onBackMobile: () => void;
  onOpenProfile: () => void;
}

export function ChatWindow({ onBackMobile, onOpenProfile }: ChatWindowProps) {
  const { user } = useAuth();
  const { activeConversation, messages, loadingMessages, typingUsers } = useChat();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#fafafa] text-center select-none">
        <div className="w-20 h-20 bg-[#09090b] rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl border border-zinc-800">
          <MessageSquareText className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-[#09090b]">Chatsin</h3>
        <p className="text-xs text-[#71717a] mt-2 max-w-sm leading-relaxed">
          Select any conversation from the sidebar or start a new conversation with contacts saved in the database.
        </p>
        <div className="mt-8 flex items-center gap-1.5 text-xs text-[#71717a] bg-white px-3.5 py-1.5 rounded-full border border-zinc-200 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#09090b]" />
          <span className="font-medium">Encrypted & Secure Session</span>
        </div>
      </div>
    );
  }

  const partner = activeConversation.participant;
  const isOnline = partner?.isOnline;

  return (
    <main className="flex-1 flex flex-col h-full bg-[#fafafa] overflow-hidden">
      {/* Chatsin Chat Header */}
      <header className="h-16 px-4 bg-white border-b border-[#e4e4e7] flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackMobile}
            className="md:hidden p-1.5 text-[#71717a] hover:text-[#09090b] hover:bg-zinc-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div
            onClick={onOpenProfile}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <Avatar src={partner?.avatarUrl} alt={partner?.username || 'User'} size="md" />
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
              )}
            </div>

            <div>
              <h2 className="text-sm font-semibold text-[#09090b] group-hover:text-black transition-colors leading-tight">
                {partner?.username || partner?.phoneNumber || 'Contact'}
              </h2>
              <p className="text-xs text-[#71717a]">
                {isOnline ? (
                  <span className="text-emerald-600 font-medium">online</span>
                ) : partner?.lastSeen ? (
                  `last seen ${formatDistanceToNow(new Date(partner.lastSeen), { addSuffix: true })}`
                ) : (
                  partner?.phoneNumber || 'offline'
                )}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenProfile}
          title="Contact Info"
          className="p-2 text-[#71717a] hover:text-[#09090b] hover:bg-zinc-100 rounded-full transition-colors"
        >
          <UserCircle2 className="w-5 h-5" />
        </button>
      </header>

      {/* Chatsin Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 chatsin-chat-bg">
        {/* Session Privacy Banner */}
        <div className="flex justify-center my-3 select-none">
          <div className="bg-white border border-[#e4e4e7] rounded-full px-3.5 py-1 text-[11px] text-[#71717a] flex items-center gap-1.5 shadow-xs max-w-md text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-[#09090b] shrink-0" />
            <span className="font-medium">Direct peer messaging stored in cloud database</span>
          </div>
        </div>

        {loadingMessages ? (
          <div className="flex items-center justify-center py-20 text-[#71717a] text-xs gap-2">
            <div className="w-5 h-5 border-2 border-[#09090b] border-t-transparent rounded-full animate-spin" />
            <span>Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center select-none">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#71717a] mb-2 shadow-sm border border-[#e4e4e7]">
              <Avatar src={partner?.avatarUrl} alt={partner?.username || 'User'} size="lg" />
            </div>
            <p className="text-xs font-semibold text-[#09090b]">
              No messages with {partner?.username || partner?.phoneNumber} yet
            </p>
            <p className="text-[11px] text-[#71717a] mt-1">Send a message to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === user?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      <TypingIndicator usernames={typingUsers} />

      {/* Message Input Bar */}
      <MessageInput />
    </main>
  );
}
