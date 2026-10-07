'use client';

import React, { useState } from 'react';
import { Users, Plus, Search, Lock, Globe, Hash } from 'lucide-react';

const DEMO_GROUPS = [
  {
    id: 'g1',
    name: 'Team Chatsin',
    description: 'Internal product team',
    members: 12,
    lastMessage: 'Design review at 3pm today',
    lastTime: '10:42 AM',
    unread: 3,
    avatarColor: '#6366f1',
    isPrivate: false,
  },
  {
    id: 'g2',
    name: 'Dev Squad',
    description: 'Engineering discussions',
    members: 8,
    lastMessage: 'Pushed fix for auth bug 🛠️',
    lastTime: 'Yesterday',
    unread: 0,
    avatarColor: '#10b981',
    isPrivate: true,
  },
  {
    id: 'g3',
    name: 'Weekend Plans',
    description: 'For the homies 🏖️',
    members: 5,
    lastMessage: 'Hike on Saturday?',
    lastTime: 'Mon',
    unread: 1,
    avatarColor: '#f59e0b',
    isPrivate: true,
  },
];

export function GroupsPanel({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const [filter, setFilter] = useState('');
  const filtered = DEMO_GROUPS.filter(g =>
    g.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <aside className="w-full md:w-80 lg:w-[410px] flex flex-col h-full bg-white border-r border-[#e4e4e7] text-[#09090b] select-none">
      {/* Header */}
      <div className="h-16 px-4 bg-white border-b border-[#e4e4e7] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#09090b]" />
          <h2 className="text-base font-bold text-[#09090b] tracking-tight">Groups</h2>
        </div>
        <button
          title="Create new group"
          className="p-2 hover:bg-[#f4f4f5] rounded-full transition-colors text-[#09090b] cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 bg-white border-b border-[#e4e4e7]">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#71717a] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search groups..."
            className="w-full bg-[#f4f4f5] focus:bg-white border border-transparent focus:border-[#09090b] rounded-xl pl-10 pr-4 py-2 text-xs text-[#09090b] placeholder-[#71717a] outline-none transition-all"
          />
        </div>
      </div>

      {/* Group list */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#f4f4f5]">
        {filtered.map(group => (
          <div
            key={group.id}
            className="px-3 py-3 flex items-center gap-3 cursor-pointer hover:bg-[#fafafa] transition-all border-l-4 border-transparent hover:border-[#09090b]"
          >
            {/* Avatar */}
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm"
              style={{ backgroundColor: group.avatarColor }}
            >
              <Hash className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-[#09090b] truncate">{group.name}</h3>
                  {group.isPrivate ? (
                    <Lock className="w-3 h-3 text-[#71717a] shrink-0" />
                  ) : (
                    <Globe className="w-3 h-3 text-[#71717a] shrink-0" />
                  )}
                </div>
                <span className={`text-[11px] shrink-0 ${group.unread > 0 ? 'text-[#09090b] font-bold' : 'text-[#71717a]'}`}>
                  {group.lastTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#71717a] truncate pr-2">{group.lastMessage}</p>
                {group.unread > 0 && (
                  <span className="shrink-0 bg-[#09090b] text-white text-[10.5px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {group.unread}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#a1a1aa] mt-0.5">{group.members} members</p>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="w-14 h-14 bg-[#f4f4f5] rounded-2xl flex items-center justify-center mb-3">
              <Users className="w-7 h-7 text-[#09090b]" />
            </div>
            <p className="text-sm font-semibold text-[#09090b]">No groups found</p>
            <p className="text-xs text-[#71717a] mt-1 mb-5">Create a new group to chat with multiple people at once.</p>
            <button className="px-4 py-2 bg-[#09090b] hover:bg-[#27272a] text-white rounded-xl text-xs font-semibold shadow-md transition-all">
              Create Group
            </button>
          </div>
        )}
      </div>

      {/* Coming soon badge */}
      <div className="px-4 py-2.5 border-t border-[#e4e4e7] bg-[#fafafa] flex items-center justify-center">
        <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest">
          Groups — Coming Soon
        </span>
      </div>
    </aside>
  );
}
