'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../ui/Avatar';
import { LogOut, Plus, MessageSquare, Search, Download, Trash2, MoreVertical, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SidebarProps {
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  onOpenDownload?: () => void;
}

interface ContextMenu {
  convId: string;
  convName: string;
  x: number;
  y: number;
}

export function Sidebar({ onOpenSearch, onOpenProfile, onOpenDownload }: SidebarProps) {
  const { user, logout } = useAuth();
  const { conversations, activeConversation, selectConversation, loadingConversations, deleteConversation } = useChat();
  const [filterQuery, setFilterQuery] = React.useState('');
  const [showDownloadBanner, setShowDownloadBanner] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chatsin_hide_download_banner') !== 'true';
    }
    return true;
  });

  // Context menu state
  const [contextMenu, setContextMenu] = React.useState<ContextMenu | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close context menu on outside click
  React.useEffect(() => {
    if (!contextMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [contextMenu]);

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

  const handleContextMenu = (e: React.MouseEvent, convId: string, convName: string) => {
    e.preventDefault();
    e.stopPropagation();
    const sidebarRect = (e.currentTarget as HTMLElement).closest('aside')?.getBoundingClientRect();
    const x = sidebarRect ? e.clientX - sidebarRect.left : e.clientX;
    const y = sidebarRect ? e.clientY - sidebarRect.top : e.clientY;
    setContextMenu({ convId, convName, x, y });
  };

  const handleDeleteClick = () => {
    if (!contextMenu) return;
    setConfirmDelete({ id: contextMenu.convId, name: contextMenu.convName });
    setContextMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteConversation(confirmDelete.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  return (
    <aside className="w-full md:w-80 lg:w-[410px] flex flex-col h-full bg-white border-r border-[#e4e4e7] text-[#09090b] select-none relative">
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
          {onOpenDownload && (
            <button
              onClick={onOpenDownload}
              title="Download Chrome & Desktop App"
              className="p-2 hover:bg-[#f4f4f5] rounded-full transition-colors text-[#09090b] hover:text-black cursor-pointer"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onOpenSearch}
            title="Contacts / New Chat"
            className="p-2 hover:bg-[#f4f4f5] rounded-full transition-colors hover:text-black cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={logout}
            title="Log out"
            className="p-2 hover:bg-[#f4f4f5] hover:text-red-600 rounded-full transition-colors cursor-pointer"
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

      {/* Download App Prompt Banner */}
      {showDownloadBanner && onOpenDownload && (
        <div className="px-3.5 py-2.5 bg-[#f4f4f5] border-b border-[#e4e4e7] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0 cursor-pointer" onClick={onOpenDownload}>
            <div className="w-7 h-7 rounded-lg bg-[#09090b] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Download className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[#09090b] text-[11px] truncate">Get Chatsin for Windows & Chrome</p>
              <p className="text-[10px] text-[#71717a] truncate">Faster messaging & background alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenDownload}
              className="px-2.5 py-1 bg-[#09090b] text-white hover:bg-[#27272a] rounded-lg text-[10px] font-bold shadow-2xs transition-colors cursor-pointer"
            >
              Get App
            </button>
            <button
              onClick={() => {
                setShowDownloadBanner(false);
                try {
                  localStorage.setItem('chatsin_hide_download_banner', 'true');
                } catch {}
              }}
              title="Dismiss banner"
              className="p-1 text-[#71717a] hover:text-[#09090b] rounded text-xs font-bold leading-none cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}

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
            const convName = partner?.username || partner?.phoneNumber || 'Contact';

            return (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv)}
                onContextMenu={(e) => handleContextMenu(e, conv.id, convName)}
                className={`px-3 py-3 flex items-center gap-3 cursor-pointer transition-all group relative ${
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
                      {convName}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      {conv.lastMessage && (
                        <span className={`text-[11px] ${conv.unreadCount > 0 ? 'text-[#09090b] font-bold' : 'text-[#71717a]'}`}>
                          {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                        </span>
                      )}
                      {/* Hover more button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleContextMenu(e, conv.id, convName); }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[#e4e4e7] transition-all ml-1 cursor-pointer"
                        title="More options"
                      >
                        <MoreVertical className="w-3.5 h-3.5 text-[#71717a]" />
                      </button>
                    </div>
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

      {/* Right-click Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="absolute z-50 bg-white border border-[#e4e4e7] rounded-xl shadow-xl py-1 min-w-[160px] overflow-hidden"
          style={{
            left: Math.min(contextMenu.x, 320),
            top: Math.min(contextMenu.y, window.innerHeight - 80),
          }}
        >
          <button
            onClick={handleDeleteClick}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">Delete Chat</span>
          </button>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-[#e4e4e7] w-72 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </div>
                <h3 className="text-sm font-bold text-[#09090b]">Delete Chat</h3>
              </div>
              <button
                onClick={() => setConfirmDelete(null)}
                className="p-1 rounded-lg hover:bg-[#f4f4f5] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[#71717a]" />
              </button>
            </div>

            <p className="px-5 pb-4 text-xs text-[#71717a] leading-relaxed">
              Delete your chat with <span className="font-semibold text-[#09090b]">{confirmDelete.name}</span>?
              This will remove it from your list. The other person can still see the conversation.
            </p>

            <div className="flex gap-2 px-5 pb-5">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 rounded-xl border border-[#e4e4e7] text-xs font-semibold text-[#09090b] hover:bg-[#f4f4f5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
