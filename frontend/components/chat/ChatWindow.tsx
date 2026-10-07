'use client';

import React, { useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { ArrowLeft, UserCircle2, Lock, MessageCircle } from 'lucide-react';
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f0f2f5] border-b-[6px] border-[#25d366] text-center select-none">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[#00a884] mb-6 shadow-sm border border-[#e9edef]">
          <MessageCircle className="w-10 h-10 fill-[#00a884]" />
        </div>
        <h3 className="text-2xl font-light text-[#41525d]">WhatsApp Web</h3>
        <p className="text-xs text-[#667781] mt-2 max-w-md leading-relaxed">
          Send and receive messages in real time without keeping your phone online.
          Select a chat to begin messaging.
        </p>
        <div className="mt-8 flex items-center gap-1.5 text-xs text-[#8696a0]">
          <Lock className="w-3.5 h-3.5" />
          <span>End-to-end encrypted</span>
        </div>
      </div>
    );
  }

  const partner = activeConversation.participant;
  const isOnline = partner?.isOnline;

  return (
    <main className="flex-1 flex flex-col h-full bg-[#efeae2] overflow-hidden">
      {/* WhatsApp Chat Header */}
      <header className="h-16 px-4 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackMobile}
            className="md:hidden p-1.5 text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef] rounded-full"
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
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25d366] rounded-full ring-2 ring-white" />
              )}
            </div>

            <div>
              <h2 className="text-sm font-semibold text-[#111b21] group-hover:text-[#00a884] transition-colors leading-tight">
                {partner?.username || partner?.phoneNumber || 'Contact'}
              </h2>
              <p className="text-xs text-[#667781]">
                {isOnline ? (
                  <span className="text-[#00a884] font-medium">online</span>
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
          className="p-2 text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef] rounded-full transition-colors"
        >
          <UserCircle2 className="w-5 h-5" />
        </button>
      </header>

      {/* WhatsApp Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1.5 whatsapp-chat-bg">
        {/* Encryption Banner */}
        <div className="flex justify-center my-3 select-none">
          <div className="bg-[#ffeecd] border border-[#ffdf9e] rounded-lg px-3 py-1.5 text-[11px] text-[#54656f] flex items-center gap-1.5 shadow-xs max-w-md text-center">
            <Lock className="w-3 h-3 text-[#54656f] shrink-0" />
            <span>Messages are private and saved in real-time.</span>
          </div>
        </div>

        {loadingMessages ? (
          <div className="flex items-center justify-center py-20 text-[#667781] text-xs gap-2">
            <div className="w-5 h-5 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin" />
            <span>Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center select-none">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#8696a0] mb-2 shadow-sm border border-[#e9edef]">
              <Avatar src={partner?.avatarUrl} alt={partner?.username || 'User'} size="lg" />
            </div>
            <p className="text-xs font-semibold text-[#111b21]">
              No messages with {partner?.username || partner?.phoneNumber} yet
            </p>
            <p className="text-[11px] text-[#667781] mt-1">Say hello to start the chat!</p>
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
