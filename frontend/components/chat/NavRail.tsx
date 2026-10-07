'use client';

import React from 'react';
import {
  MessageSquare,
  Users,
  Radio,
  CircleDot,
  Settings,
  MessageSquareText,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';

export type NavTab = 'chats' | 'groups' | 'communities' | 'status' | 'settings';

interface NavRailProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenProfile: () => void;
}

const tabs: { id: NavTab; icon: React.FC<any>; label: string }[] = [
  { id: 'chats', icon: MessageSquare, label: 'Chats' },
  { id: 'groups', icon: Users, label: 'Groups' },
  { id: 'communities', icon: Radio, label: 'Communities' },
  { id: 'status', icon: CircleDot, label: 'Status' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function NavRail({ activeTab, onTabChange, onOpenProfile }: NavRailProps) {
  const { user } = useAuth();

  return (
    <nav className="w-[68px] h-full flex flex-col items-center py-3 gap-1 bg-[#09090b] border-r border-[#1a1a1a] shrink-0 select-none">
      {/* Logo */}
      <div className="mb-4 mt-1 flex flex-col items-center">
        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg">
          <MessageSquareText className="w-5 h-5 text-[#09090b]" />
        </div>
      </div>

      {/* Nav tabs */}
      <div className="flex-1 flex flex-col items-center gap-1 w-full px-2">
        {tabs.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              title={label}
              className={`w-full flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all duration-150 group relative cursor-pointer ${
                isActive
                  ? 'bg-white text-[#09090b]'
                  : 'text-[#71717a] hover:bg-[#27272a] hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[9px] font-semibold mt-1 tracking-wide ${isActive ? 'text-[#09090b]' : 'text-[#71717a] group-hover:text-white'}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-r-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* User avatar at bottom */}
      <div className="mt-2 mb-1">
        <button
          onClick={onOpenProfile}
          title="My Profile"
          className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#27272a] hover:ring-white transition-all cursor-pointer"
        >
          <Avatar src={user?.avatarUrl} alt={user?.username || 'Me'} size="sm" />
        </button>
      </div>
    </nav>
  );
}
