'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../ui/Avatar';
import { api } from '../../lib/api';
import { X, Phone, Mail, Calendar, Edit3, Check, ShieldCheck, Download } from 'lucide-react';
import { format } from 'date-fns';

interface UserProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserOverride?: any;
  onOpenDownload?: () => void;
}

export function UserProfilePanel({ isOpen, onClose, targetUserOverride, onOpenDownload }: UserProfilePanelProps) {
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
    <aside className="w-full lg:w-[380px] bg-[#f4f4f5] border-l border-[#e4e4e7] flex flex-col h-full text-[#09090b] select-none z-20 shrink-0 animate-fade-in">
      {/* Header */}
      <div className="h-16 px-4 bg-white border-b border-[#e4e4e7] flex items-center justify-between shrink-0">
        <h3 className="text-base font-semibold text-[#09090b]">
          {isOwnProfile ? 'My Profile' : 'Contact Details'}
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 text-[#71717a] hover:text-[#09090b] hover:bg-[#f4f4f5] rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Profile Content */}
      <div className="flex-1 overflow-y-auto space-y-2.5 p-2">
        {/* Avatar & Display Name Card */}
        <div className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-xs border border-[#e4e4e7]">
          <div className="relative mb-4">
            <Avatar src={displayUser?.avatarUrl} alt={displayUser?.username || 'User'} size="xl" />
            {displayUser?.isOnline && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white" />
            )}
          </div>

          <h2 className="text-xl font-bold text-[#09090b] mb-1">{displayUser?.username}</h2>
          <p className="text-xs font-medium text-emerald-600">
            {displayUser?.isOnline ? 'Online' : 'Offline'}
          </p>
        </div>

        {/* Mobile Number Card */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#e4e4e7]">
          <span className="text-[11px] font-bold text-[#71717a] uppercase tracking-wider block mb-2">
            Mobile Number
          </span>
          <div className="flex items-center gap-3 text-[#09090b]">
            <Phone className="w-4 h-4 text-[#09090b] shrink-0" />
            <span className="text-sm font-semibold">
              {displayUser?.phoneNumber || 'No mobile number set'}
            </span>
          </div>
        </div>

        {/* About / Bio Card */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#e4e4e7]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#71717a] uppercase tracking-wider">
              About
            </span>
            {isOwnProfile && !isEditingBio && (
              <button
                onClick={() => {
                  setBioInput(displayUser?.bio || '');
                  setIsEditingBio(true);
                }}
                className="text-[#09090b] hover:text-black flex items-center gap-1 text-xs font-semibold"
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
                className="w-full bg-[#f4f4f5] border border-zinc-200 focus:border-[#09090b] rounded-xl p-2.5 text-xs text-[#09090b] focus:outline-none"
                placeholder="Add your about info..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingBio(false)}
                  className="px-3 py-1 text-xs text-[#71717a] hover:text-[#09090b]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBio}
                  disabled={savingBio}
                  className="px-3 py-1 text-xs bg-[#09090b] hover:bg-[#27272a] text-white font-medium rounded-lg flex items-center gap-1 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#52525b] leading-relaxed">
              {displayUser?.bio || 'Hey there! I am using Chatsin.'}
            </p>
          )}
        </div>

        {/* Email Card (if present) */}
        {displayUser?.email && (
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#e4e4e7]">
            <span className="text-[11px] font-bold text-[#71717a] uppercase tracking-wider block mb-2">
              Email
            </span>
            <div className="flex items-center gap-3 text-[#09090b]">
              <Mail className="w-4 h-4 text-[#71717a] shrink-0" />
              <span className="text-xs text-[#52525b] truncate">{displayUser.email}</span>
            </div>
          </div>
        )}
        {/* Download App Option */}
        {onOpenDownload && (
          <button
            onClick={() => {
              onClose();
              onOpenDownload();
            }}
            className="w-full bg-[#f4f4f5] hover:bg-[#e4e4e7] rounded-2xl p-4 shadow-xs border border-[#e4e4e7] flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#09090b] text-white flex items-center justify-center shrink-0">
                <Download className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#09090b]">Download Chatsin App</p>
                <p className="text-[11px] text-[#71717a]">Chrome Extension & Desktop Launcher</p>
              </div>
            </div>
            <span className="text-xs text-[#09090b] font-bold">Install →</span>
          </button>
        )}

        {/* Security & Join Date */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#e4e4e7] space-y-3">
          <div className="flex items-center gap-2.5 text-xs text-[#71717a]">
            <ShieldCheck className="w-4 h-4 text-[#09090b]" />
            <span>Messages are encrypted & secure.</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[#71717a]">
            <Calendar className="w-4 h-4 text-[#71717a]" />
            <span>
              Joined {displayUser?.createdAt ? format(new Date(displayUser.createdAt), 'MMMM yyyy') : 'Recently'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
