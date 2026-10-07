'use client';

import React from 'react';
import { CircleDot, Plus, Eye, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';

const DEMO_STATUSES = [
  { id: 's1', username: 'Rohan M.', avatarUrl: null, seen: false, timeAgo: '2m ago', count: 3 },
  { id: 's2', username: 'Priya K.', avatarUrl: null, seen: false, timeAgo: '14m ago', count: 1 },
  { id: 's3', username: 'Alex D.', avatarUrl: null, seen: true, timeAgo: '3h ago', count: 2 },
  { id: 's4', username: 'Meera J.', avatarUrl: null, seen: true, timeAgo: '6h ago', count: 5 },
];

export function StatusPanel() {
  const { user } = useAuth();

  return (
    <aside className="w-full md:w-80 lg:w-[410px] flex flex-col h-full bg-white border-r border-[#e4e4e7] text-[#09090b] select-none">
      {/* Header */}
      <div className="h-16 px-4 bg-white border-b border-[#e4e4e7] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <CircleDot className="w-5 h-5 text-[#09090b]" />
          <h2 className="text-base font-bold text-[#09090b] tracking-tight">Status</h2>
        </div>
        <button
          title="Add status"
          className="p-2 hover:bg-[#f4f4f5] rounded-full transition-colors text-[#09090b] cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* My status */}
        <div className="px-4 py-3 border-b border-[#f4f4f5]">
          <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest mb-2">My Status</p>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-[#fafafa] rounded-xl p-2 -mx-2 transition-all">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full ring-2 ring-dashed ring-[#d4d4d8] flex items-center justify-center overflow-hidden">
                <Avatar src={user?.avatarUrl} alt={user?.username || 'Me'} size="md" />
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#09090b] rounded-full flex items-center justify-center ring-2 ring-white">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#09090b]">My status</p>
              <p className="text-xs text-[#71717a]">Tap to add status update</p>
            </div>
          </div>
        </div>

        {/* Recent updates — unseen */}
        <div className="px-4 py-2 border-b border-[#f4f4f5]">
          <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest mb-1">Recent Updates</p>
        </div>
        {DEMO_STATUSES.filter(s => !s.seen).map(status => (
          <div key={status.id} className="px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-[#fafafa] transition-all border-l-4 border-transparent hover:border-[#09090b]">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full ring-[2.5px] ring-[#09090b] p-0.5">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <Avatar src={status.avatarUrl} alt={status.username} size="md" />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#09090b] truncate">{status.username}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-[#71717a]">
                <Clock className="w-3 h-3" />
                <span>{status.timeAgo}</span>
                <span>·</span>
                <span>{status.count} update{status.count > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Viewed updates */}
        {DEMO_STATUSES.filter(s => s.seen).length > 0 && (
          <>
            <div className="px-4 py-2 mt-1 border-b border-[#f4f4f5]">
              <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest">Viewed</p>
            </div>
            {DEMO_STATUSES.filter(s => s.seen).map(status => (
              <div key={status.id} className="px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-[#fafafa] transition-all border-l-4 border-transparent hover:border-[#d4d4d8]">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full ring-[2px] ring-[#d4d4d8] p-0.5">
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <Avatar src={status.avatarUrl} alt={status.username} size="md" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#a1a1aa] rounded-full flex items-center justify-center ring-2 ring-white">
                    <Eye className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#71717a] truncate">{status.username}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#a1a1aa]">
                    <Clock className="w-3 h-3" />
                    <span>{status.timeAgo}</span>
                    <span>·</span>
                    <span>{status.count} update{status.count > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Coming soon */}
      <div className="px-4 py-2.5 border-t border-[#e4e4e7] bg-[#fafafa] flex items-center justify-center">
        <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest">
          Status — Coming Soon
        </span>
      </div>
    </aside>
  );
}
