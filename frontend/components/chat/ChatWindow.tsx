'use client';

import React, { useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { StatusDot } from '../ui/StatusDot';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { ArrowLeft, UserCircle2, MessageSquareDashed } from 'lucide-react';
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-center select-none">
        <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center text-indigo-400 mb-4 shadow-xl">
          <MessageSquareDashed className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-white">Select a conversation</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          Choose a contact from the sidebar or click &ldquo;+&rdquo; to discover contacts and start chatting.
        </p>
      </div>
    );
  }

  const partner = activeConversation.participant;
  const isOnline = partner?.isOnline;

  return (
    <main className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="p-4 bg-slate-900/80 backdrop-blur border-b border-slate-800/80 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div
            onClick={onOpenProfile}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <Avatar src={partner?.avatarUrl} alt={partner?.username || 'User'} size="md" />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-slate-900 ${
                  isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
              />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                {partner?.username || 'Chat'}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <StatusDot isOnline={isOnline} />
                <span>
                  {isOnline
                    ? 'Online'
                    : partner?.lastSeen
                    ? `Last seen ${formatDistanceToNow(new Date(partner.lastSeen), { addSuffix: true })}`
                    : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenProfile}
          title="View profile info"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <UserCircle2 className="w-5 h-5" />
        </button>
      </header>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {loadingMessages ? (
          <div className="flex items-center justify-center py-20 text-slate-500 text-sm gap-2">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading message history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center select-none">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-600 mb-2">
              <Avatar src={partner?.avatarUrl} alt={partner?.username || 'User'} size="lg" />
            </div>
            <p className="text-sm font-medium text-slate-300">
              No messages with {partner?.username || 'this user'} yet
            </p>
            <p className="text-xs text-slate-500 mt-1">Send a greeting to start the conversation!</p>
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

      {/* Message Input Form */}
      <MessageInput />
    </main>
  );
}
