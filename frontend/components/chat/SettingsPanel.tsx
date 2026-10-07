'use client';

import React from 'react';
import { Settings, Bell, Lock, Palette, HelpCircle, LogOut, User, Shield, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';

interface SettingsPanelProps {
  onOpenProfile: () => void;
  onOpenDownload?: () => void;
}

const SETTING_GROUPS = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Profile', description: 'Name, bio, avatar' },
      { icon: Lock, label: 'Privacy', description: 'Blocked contacts, data' },
      { icon: Shield, label: 'Security', description: 'Two-step verification' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: Bell, label: 'Notifications', description: 'Message & call alerts' },
      { icon: Palette, label: 'Appearance', description: 'Theme, font size' },
    ],
  },
  {
    title: 'Help',
    items: [
      { icon: HelpCircle, label: 'Help Center', description: 'FAQs, support' },
    ],
  },
];

export function SettingsPanel({ onOpenProfile, onOpenDownload }: SettingsPanelProps) {
  const { user, logout } = useAuth();

  return (
    <aside className="w-full md:w-80 lg:w-[410px] flex flex-col h-full bg-white border-r border-[#e4e4e7] text-[#09090b] select-none">
      {/* Header */}
      <div className="h-16 px-4 bg-white border-b border-[#e4e4e7] flex items-center gap-2 shrink-0">
        <Settings className="w-5 h-5 text-[#09090b]" />
        <h2 className="text-base font-bold text-[#09090b] tracking-tight">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile card */}
        <div
          onClick={onOpenProfile}
          className="mx-3 mt-3 mb-1 px-3 py-3 bg-[#fafafa] hover:bg-[#f4f4f5] border border-[#e4e4e7] rounded-2xl flex items-center gap-3 cursor-pointer transition-all"
        >
          <div className="relative shrink-0">
            <Avatar src={user?.avatarUrl} alt={user?.username || 'User'} size="lg" />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#09090b] truncate">{user?.username}</p>
            <p className="text-xs text-[#71717a] truncate">{user?.phoneNumber || user?.email}</p>
            {user?.bio && <p className="text-[11px] text-[#a1a1aa] truncate mt-0.5 italic">{user.bio}</p>}
          </div>
          <span className="text-[10px] font-semibold text-[#71717a] shrink-0">Edit →</span>
        </div>

        {/* Setting groups */}
        {SETTING_GROUPS.map(group => (
          <div key={group.title} className="mt-4">
            <p className="px-4 mb-1 text-[10px] font-bold text-[#71717a] uppercase tracking-widest">
              {group.title}
            </p>
            <div className="mx-3 border border-[#e4e4e7] rounded-2xl overflow-hidden divide-y divide-[#f4f4f5]">
              {group.items.map(({ icon: Icon, label, description }) => (
                <button
                  key={label}
                  className="w-full flex items-center gap-3 px-3.5 py-3 hover:bg-[#fafafa] transition-all text-left cursor-pointer"
                >
                  <div className="w-9 h-9 bg-[#f4f4f5] rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 text-[#09090b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#09090b]">{label}</p>
                    <p className="text-[11px] text-[#71717a]">{description}</p>
                  </div>
                  <span className="text-[#d4d4d8] text-sm shrink-0">›</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Download */}
        {onOpenDownload && (
          <div className="mt-4">
            <div className="mx-3 border border-[#e4e4e7] rounded-2xl overflow-hidden">
              <button
                onClick={onOpenDownload}
                className="w-full flex items-center gap-3 px-3.5 py-3 hover:bg-[#fafafa] transition-all text-left cursor-pointer"
              >
                <div className="w-9 h-9 bg-[#f4f4f5] rounded-xl flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4 text-[#09090b]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#09090b]">Get Desktop & Chrome App</p>
                  <p className="text-[11px] text-[#71717a]">Faster access & background alerts</p>
                </div>
                <span className="text-[#d4d4d8] text-sm shrink-0">›</span>
              </button>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="mt-4 mb-6">
          <div className="mx-3 border border-red-100 rounded-2xl overflow-hidden">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3.5 py-3 hover:bg-red-50 transition-all text-left cursor-pointer"
            >
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                <LogOut className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-sm font-medium text-red-500">Log Out</p>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
