'use client';

import React from 'react';
import { Radio, Plus, Megaphone, ArrowRight, Users, Sparkles } from 'lucide-react';

const DEMO_COMMUNITIES = [
  {
    id: 'c1',
    name: 'Chatsin Official',
    description: 'Product updates, tips & announcements',
    members: '2.4K',
    channels: 4,
    avatarColor: '#6366f1',
    isVerified: true,
    lastUpdate: '2h ago',
  },
  {
    id: 'c2',
    name: 'Tech Builders',
    description: 'Open source & startup community',
    members: '1.1K',
    channels: 7,
    avatarColor: '#10b981',
    isVerified: false,
    lastUpdate: '5h ago',
  },
  {
    id: 'c3',
    name: 'Design Circle',
    description: 'UI/UX design resources & critique',
    members: '870',
    channels: 3,
    avatarColor: '#f43f5e',
    isVerified: false,
    lastUpdate: 'Yesterday',
  },
];

export function CommunitiesPanel() {
  return (
    <aside className="w-full md:w-80 lg:w-[410px] flex flex-col h-full bg-white border-r border-[#e4e4e7] text-[#09090b] select-none">
      {/* Header */}
      <div className="h-16 px-4 bg-white border-b border-[#e4e4e7] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-[#09090b]" />
          <h2 className="text-base font-bold text-[#09090b] tracking-tight">Communities</h2>
        </div>
        <button
          title="Create community"
          className="p-2 hover:bg-[#f4f4f5] rounded-full transition-colors text-[#09090b] cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Hero banner */}
      <div className="mx-3 mt-3 mb-1 px-4 py-3 bg-[#09090b] rounded-2xl text-white flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold">Discover Communities</p>
          <p className="text-[10px] text-white/60 mt-0.5">Join public communities or create your own</p>
        </div>
        <ArrowRight className="w-4 h-4 text-white/50 shrink-0" />
      </div>

      {/* Community list */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#f4f4f5] mt-2">
        {DEMO_COMMUNITIES.map(community => (
          <div
            key={community.id}
            className="px-3 py-3.5 flex items-start gap-3 cursor-pointer hover:bg-[#fafafa] transition-all border-l-4 border-transparent hover:border-[#09090b]"
          >
            {/* Avatar */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm"
              style={{ backgroundColor: community.avatarColor }}
            >
              <Megaphone className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h3 className="text-sm font-semibold text-[#09090b] truncate">{community.name}</h3>
                {community.isVerified && (
                  <span className="shrink-0 w-4 h-4 rounded-full bg-[#09090b] text-white flex items-center justify-center text-[8px] font-black">✓</span>
                )}
              </div>
              <p className="text-xs text-[#71717a] truncate">{community.description}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-[10px] text-[#a1a1aa]">
                  <Users className="w-3 h-3" />
                  {community.members} members
                </span>
                <span className="flex items-center gap-1 text-[10px] text-[#a1a1aa]">
                  <Radio className="w-3 h-3" />
                  {community.channels} channels
                </span>
                <span className="text-[10px] text-[#a1a1aa]">{community.lastUpdate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coming soon */}
      <div className="px-4 py-2.5 border-t border-[#e4e4e7] bg-[#fafafa] flex items-center justify-center">
        <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest">
          Communities — Coming Soon
        </span>
      </div>
    </aside>
  );
}
