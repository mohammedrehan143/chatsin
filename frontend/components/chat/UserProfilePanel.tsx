'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../ui/Avatar';
import { api } from '../../lib/api';
import { X, Phone, Mail, Calendar, Edit3, Check, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

interface UserProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserOverride?: any;
}

export function UserProfilePanel({ isOpen, onClose, targetUserOverride }: UserProfilePanelProps) {
  const { user: currentUser, updateUser } = useAuth();
  const { activeConversation } = useChat();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [savingBio, setSavingBio] = useState(false);

  if (!isOpen) return null;

  const displayUser = targetUserOverride || activeConversation?.participant || currentUser;
  const isOwnProfile = displayUser?.id === currentUser?.id;

  const handleSaveBio = async () => {
    try {
      setSavingBio(true);
      const res = await api.updateProfile({ bio: bioInput });
      updateUser({ bio: res.bio });
      setIsEditingBio(false);
    } catch (err) {
      console.error('Failed to update bio', err);
    } finally {
      setSavingBio(false);
    }
  };

  return (
    <aside className="w-full lg:w-[380px] bg-[#f0f2f5] border-l border-[#e9edef] flex flex-col h-full text-[#111b21] select-none z-20 shrink-0">
      {/* Header */}
      <div className="h-16 px-4 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center justify-between shrink-0">
        <h3 className="text-base font-semibold text-[#111b21]">
          {isOwnProfile ? 'Profile' : 'Contact info'}
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef] rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Profile Content */}
      <div className="flex-1 overflow-y-auto space-y-2.5">
        {/* Avatar & Display Name Card */}
        <div className="bg-white p-6 flex flex-col items-center text-center shadow-xs border-b border-[#e9edef]">
          <div className="relative mb-4">
            <Avatar src={displayUser?.avatarUrl} alt={displayUser?.username || 'User'} size="xl" />
            {displayUser?.isOnline && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-[#25d366] rounded-full ring-2 ring-white" />
            )}
          </div>

          <h2 className="text-xl font-medium text-[#111b21] mb-1">{displayUser?.username}</h2>
          <p className="text-xs text-[#00a884] font-medium">
            {displayUser?.isOnline ? 'Online' : 'Offline'}
          </p>
        </div>

        {/* Mobile Number Card */}
        <div className="bg-white p-4 shadow-xs border-b border-[#e9edef]">
          <span className="text-[11px] font-semibold text-[#667781] uppercase tracking-wider block mb-2">
            Mobile Number
          </span>
          <div className="flex items-center gap-3 text-[#111b21]">
            <Phone className="w-4 h-4 text-[#00a884] shrink-0" />
            <span className="text-sm font-medium">
              {displayUser?.phoneNumber || 'No mobile number set'}
            </span>
          </div>
        </div>

        {/* About / Bio Card */}
        <div className="bg-white p-4 shadow-xs border-b border-[#e9edef]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#667781] uppercase tracking-wider">
              About
            </span>
            {isOwnProfile && !isEditingBio && (
              <button
                onClick={() => {
                  setBioInput(displayUser?.bio || '');
                  setIsEditingBio(true);
                }}
                className="text-[#00a884] hover:text-[#008069] flex items-center gap-1 text-xs font-medium"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>

          {isEditingBio ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                maxLength={250}
                rows={3}
                className="w-full bg-[#f0f2f5] border border-[#d1d7db] focus:border-[#00a884] rounded-lg p-2.5 text-xs text-[#111b21] focus:outline-none"
                placeholder="Add your about info..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingBio(false)}
                  className="px-3 py-1 text-xs text-[#667781] hover:text-[#111b21]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBio}
                  disabled={savingBio}
                  className="px-3 py-1 text-xs bg-[#00a884] hover:bg-[#008069] text-white font-medium rounded-lg flex items-center gap-1 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#3b4a54] leading-relaxed">
              {displayUser?.bio || 'Hey there! I am using WhatsApp.'}
            </p>
          )}
        </div>

        {/* Email Card (if present) */}
        {displayUser?.email && (
          <div className="bg-white p-4 shadow-xs border-b border-[#e9edef]">
            <span className="text-[11px] font-semibold text-[#667781] uppercase tracking-wider block mb-2">
              Email
            </span>
            <div className="flex items-center gap-3 text-[#111b21]">
              <Mail className="w-4 h-4 text-[#8696a0] shrink-0" />
              <span className="text-xs text-[#3b4a54] truncate">{displayUser.email}</span>
            </div>
          </div>
        )}

        {/* Security & Join Date */}
        <div className="bg-white p-4 shadow-xs border-b border-[#e9edef] space-y-3">
          <div className="flex items-center gap-2.5 text-xs text-[#667781]">
            <ShieldCheck className="w-4 h-4 text-[#00a884]" />
            <span>Messages and calls are end-to-end encrypted.</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[#667781]">
            <Calendar className="w-4 h-4 text-[#8696a0]" />
            <span>
              Joined {displayUser?.createdAt ? format(new Date(displayUser.createdAt), 'MMMM yyyy') : 'Recently'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
