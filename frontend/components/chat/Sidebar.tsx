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
  const [filterQuery, setFilterQuery] = React.useState('');

  const filteredConversations = React.useMemo(() => {
    if (!filterQuery.trim()) return conversations;
    const q = filterQuery.toLowerCase().trim();
    return conversations.filter(
      (c) =>
        (c.participant?.username && c.participant.username.toLowerCase().includes(q)) ||
        (c.participant?.phoneNumber && c.participant.phoneNumber.includes(q)) ||
        (c.lastMessage?.content && c.lastMessage.content.toLowerCase().includes(q))
    );
  }, [conversations, filterQuery]);

  return (
    <aside className="w-full md:w-80 lg:w-[410px] flex flex-col h-full bg-white border-r border-[#e4e4e7] text-[#09090b] select-none">
      {/* Chatsin Top Bar */}
      <div className="h-16 px-4 bg-white border-b border-[#e4e4e7] flex items-center justify-between shrink-0">
        <div
          onClick={onOpenProfile}
          className="flex items-center gap-3 cursor-pointer group"
          title="Click to view my profile"
        >
          <div className="relative">
            <Avatar src={user?.avatarUrl} alt={user?.username || 'User'} size="md" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[#09090b] truncate group-hover:text-black transition-colors">
              {user?.username}
            </h2>
            <p className="text-[11px] text-[#71717a] truncate font-medium">
              {user?.phoneNumber || user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#71717a]">
          <button
            onClick={onOpenSearch}
            title="Contacts / New Chat"
            className="p-2 hover:bg-[#f4f4f5] rounded-full transition-colors hover:text-black"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={logout}
            title="Log out"
            className="p-2 hover:bg-[#f4f4f5] hover:text-red-600 rounded-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chatsin Search Bar */}
      <div className="p-3 bg-white border-b border-[#e4e4e7]">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#71717a] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search chats or database contacts..."
            className="w-full bg-[#f4f4f5] focus:bg-white border border-transparent focus:border-[#09090b] rounded-xl pl-10 pr-8 py-2 text-xs text-[#09090b] placeholder-[#71717a] outline-none transition-all shadow-xs"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="absolute right-3 text-xs text-[#71717a] hover:text-[#09090b] font-bold"
            >
              ×
            </button>
          )}
        </div>
        {filterQuery && (
          <button
            onClick={onOpenSearch}
            className="mt-2 w-full text-left px-3 py-1.5 bg-[#09090b] text-white hover:bg-[#27272a] rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between shadow-xs"
          >
            <span>Search &ldquo;{filterQuery}&rdquo; in database contacts</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Search →</span>
          </button>
        )}
      </div>

      {/* Chatsin Conversation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#f4f4f5]">
        {loadingConversations ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#71717a] text-xs gap-2">
            <div className="w-6 h-6 border-2 border-[#09090b] border-t-transparent rounded-full animate-spin" />
            <span>Loading conversations...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="w-14 h-14 bg-[#f4f4f5] rounded-2xl flex items-center justify-center mb-3 text-[#09090b] shadow-xs">
              <MessageSquare className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-[#09090b]">
              {filterQuery ? 'No matching chat found' : 'No chats yet'}
            </p>
            <p className="text-xs text-[#71717a] mt-1 mb-5">
              {filterQuery
                ? `Search all database contacts for "${filterQuery}"`
                : 'Start chatting with any contact saved in your database.'}
            </p>
            <button
              onClick={onOpenSearch}
              className="px-4 py-2 bg-[#09090b] hover:bg-[#27272a] text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-98"
            >
              {filterQuery ? 'Search Database Contacts' : 'View Contacts & Start Chat'}
            </button>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = activeConversation?.id === conv.id;
            const partner = conv.participant;
            const isOnline = partner?.isOnline;

            return (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`px-3 py-3 flex items-center gap-3 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#f4f4f5] border-l-4 border-[#09090b]'
                    : 'hover:bg-[#fafafa] bg-white border-l-4 border-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar src={partner?.avatarUrl} alt={partner?.username || 'User'} size="md" />
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0 border-b border-[#f4f4f5] pb-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-[#09090b] truncate">
                      {partner?.username || partner?.phoneNumber || 'Contact'}
                    </h3>
                    {conv.lastMessage && (
                      <span className={`text-[11px] shrink-0 ${conv.unreadCount > 0 ? 'text-[#09090b] font-bold' : 'text-[#71717a]'}`}>
                        {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#71717a] truncate pr-2 font-normal">
                      {conv.lastMessage ? conv.lastMessage.content : (partner?.phoneNumber || 'No messages yet')}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 bg-[#09090b] text-white text-[10.5px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-xs">
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
