'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../ui/Avatar';
import { User } from '../../types';
import { Search, X, MessageSquarePlus, Phone } from 'lucide-react';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserSearchModal({ isOpen, onClose }: UserSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { startDirectConversation } = useChat();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    async function search() {
      try {
        setLoading(true);
        const users = await api.searchUsers(query);
        setResults(users);
      } catch (err) {
        console.error('Failed to search users', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      search();
    }, 180);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const handleSelectUser = async (user: User) => {
    await startDirectConversation(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-[#e4e4e7]">
        {/* Chatsin Header */}
        <div className="px-5 py-4 bg-[#09090b] text-white flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-white" />
            Chatsin Contacts
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 bg-[#f4f4f5] border-b border-[#e4e4e7]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#71717a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, username, or phone..."
              className="w-full bg-white border border-zinc-200 focus:border-[#09090b] rounded-xl pl-10 pr-4 py-2 text-sm text-[#09090b] placeholder-[#71717a] focus:outline-none transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#f4f4f5]">
          {loading ? (
            <div className="py-12 flex items-center justify-center text-[#71717a] text-xs gap-2">
              <div className="w-5 h-5 border-2 border-[#09090b] border-t-transparent rounded-full animate-spin" />
              <span>Searching database contacts...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 px-6 text-center text-[#71717a] text-xs">
              {query
                ? `No contact found matching "${query}"`
                : 'No other contacts in database yet. Register another user to start chatting!'}
            </div>
          ) : (
            <div>
              <div className="px-4 py-2 bg-[#f8fafc] border-b border-[#e4e4e7] text-[11px] font-semibold text-[#71717a] tracking-wider uppercase flex justify-between items-center">
                <span>{query ? 'Search Results' : 'Contacts in Database'}</span>
                <span className="text-[#09090b] font-bold">{results.length} found</span>
              </div>
              {results.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className="px-4 py-3 flex items-center justify-between hover:bg-[#f4f4f5] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar src={u.avatarUrl} alt={u.username} size="md" />
                      {u.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white bg-emerald-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#09090b]">{u.username}</h4>
                      <p className="text-xs text-[#71717a] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-[#09090b]" />
                        <span>{u.phoneNumber || u.email}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-white bg-[#09090b] px-3 py-1 rounded-full hover:bg-[#27272a] transition-all shadow-xs">
                    Chat
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
