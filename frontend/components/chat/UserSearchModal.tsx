'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../ui/Avatar';
import { StatusDot } from '../ui/StatusDot';
import { User } from '../../types';
import { Search, X, MessageSquarePlus } from 'lucide-react';

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
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const handleSelectUser = async (user: User) => {
    await startDirectConversation(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-indigo-400" />
            New Conversation
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="p-4 border-b border-slate-800/80">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username or email..."
              className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="py-12 flex items-center justify-center text-slate-500 text-sm gap-2">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span>Searching users...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              {query ? 'No users found matching your query' : 'Type to search for contacts'}
            </div>
          ) : (
            results.map((u) => (
              <div
                key={u.id}
                onClick={() => handleSelectUser(u)}
                className="p-3 rounded-xl flex items-center justify-between hover:bg-slate-800/70 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar src={u.avatarUrl} alt={u.username} size="md" />
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${
                        u.isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{u.username}</h4>
                    <p className="text-xs text-slate-400 truncate max-w-[200px]">{u.email}</p>
                  </div>
                </div>

                <StatusDot isOnline={u.isOnline} showText />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
