'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../ui/Avatar';
import { LogOut, Plus, MessageSquare, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SidebarProps {
  onOpenSearch: () => void;
  onOpenProfile: () => void;
}

export function Sidebar({ onOpenSearch, onOpenProfile }: SidebarProps) {
  const { user, logout } = useAuth();
  const { conversations, activeConversation, selectConversation, loadingConversations } = useChat();

  return (
    <aside className="w-full md:w-80 lg:w-[410px] flex flex-col h-full bg-white border-r border-[#e9edef] text-[#111b21] select-none">
      {/* WhatsApp Header */}
      <div className="h-16 px-4 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center justify-between shrink-0">
        <div
          onClick={onOpenProfile}
          className="flex items-center gap-3 cursor-pointer group"
          title="Click to view my profile"
        >
          <div className="relative">
            <Avatar src={user?.avatarUrl} alt={user?.username || 'User'} size="md" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25d366] rounded-full ring-2 ring-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[#111b21] truncate group-hover:text-[#00a884] transition-colors">
              {user?.username}
            </h2>
            <p className="text-[11px] text-[#667781] truncate">
              {user?.phoneNumber || user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#54656f]">
          <button
            onClick={onOpenSearch}
            title="New Chat"
            className="p-2 hover:bg-[#e9edef] rounded-full transition-colors"
          >
            <Plus className="w-5 h-5 text-[#54656f] hover:text-[#00a884]" />
          </button>
          <button
            onClick={logout}
            title="Log out"
            className="p-2 hover:bg-[#e9edef] hover:text-red-600 rounded-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* WhatsApp Search Bar */}
      <div className="p-2 bg-white border-b border-[#e9edef]">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#54656f] absolute left-3 pointer-events-none" />
          <button
            onClick={onOpenSearch}
            className="w-full text-left bg-[#f0f2f5] hover:bg-[#e9edef] rounded-lg pl-10 pr-4 py-1.5 text-xs text-[#54656f] transition-colors flex items-center justify-between"
          >
            <span>Search or start new chat</span>
          </button>
        </div>
      </div>

      {/* WhatsApp Chat List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#f0f2f5]">
        {loadingConversations ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#667781] text-xs gap-2">
            <div className="w-6 h-6 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin" />
            <span>Loading chats...</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="w-14 h-14 bg-[#f0f2f5] rounded-full flex items-center justify-center mb-3 text-[#00a884]">
              <MessageSquare className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-[#111b21]">No chats yet</p>
            <p className="text-xs text-[#667781] mt-1 mb-5">
              Start chatting by searching for contacts using their mobile number or username.
            </p>
            <button
              onClick={onOpenSearch}
              className="px-4 py-2 bg-[#00a884] hover:bg-[#008069] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              Start New Chat
            </button>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = activeConversation?.id === conv.id;
            const partner = conv.participant;
            const isOnline = partner?.isOnline;

            return (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`px-3 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[#f0f2f5]'
                    : 'hover:bg-[#f5f6f6] bg-white'
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar src={partner?.avatarUrl} alt={partner?.username || 'User'} size="md" />
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25d366] rounded-full ring-2 ring-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0 border-b border-[#f0f2f5] pb-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-[#111b21] truncate">
                      {partner?.username || partner?.phoneNumber || 'Contact'}
                    </h3>
                    {conv.lastMessage && (
                      <span className={`text-[11px] shrink-0 ${conv.unreadCount > 0 ? 'text-[#25d366] font-semibold' : 'text-[#667781]'}`}>
                        {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#667781] truncate pr-2">
                      {conv.lastMessage ? conv.lastMessage.content : (partner?.phoneNumber || 'No messages yet')}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 bg-[#25d366] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
