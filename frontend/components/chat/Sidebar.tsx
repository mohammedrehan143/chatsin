'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../ui/Avatar';
import { StatusDot } from '../ui/StatusDot';
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
    <aside className="w-full md:w-80 lg:w-96 flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 select-none">
      {/* User Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50 backdrop-blur">
        <div
          onClick={onOpenProfile}
          className="flex items-center gap-3 cursor-pointer group hover:opacity-90 transition-opacity"
        >
          <div className="relative">
            <Avatar src={user?.avatarUrl} alt={user?.username || 'User'} size="md" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
              {user?.username}
            </h2>
            <p className="text-xs text-slate-400 truncate max-w-[140px]">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenSearch}
            title="Start new conversation"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 text-indigo-400" />
          </button>
          <button
            onClick={logout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar Trigger */}
      <div className="p-3">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-slate-400 text-sm transition-all"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span>Search or start a chat...</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {loadingConversations ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-sm gap-2">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading conversations...</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-3 text-slate-500">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-300">No conversations yet</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">Search users to begin chatting in real time</p>
            <button
              onClick={onOpenSearch}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Find Contacts
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
                className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-white border border-indigo-500/30 shadow-sm'
                    : 'hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar src={partner?.avatarUrl} alt={partner?.username || 'User'} size="md" />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-slate-900 ${
                      isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-sm font-semibold truncate text-white">
                      {partner?.username || 'Chat'}
                    </h3>
                    {conv.lastMessage && (
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 truncate pr-2">
                      {conv.lastMessage ? conv.lastMessage.content : 'No messages yet'}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
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
