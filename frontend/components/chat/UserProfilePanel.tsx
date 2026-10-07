'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../ui/Avatar';
import { StatusDot } from '../ui/StatusDot';
import { api } from '../../lib/api';
import { X, Mail, Calendar, ShieldCheck, Edit3, Check } from 'lucide-react';
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
    <aside className="w-full lg:w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full text-slate-100 select-none z-20">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          {isOwnProfile ? 'My Profile' : 'Contact Information'}
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Details */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center text-center">
        <div className="relative mb-4">
          <Avatar src={displayUser?.avatarUrl} alt={displayUser?.username || 'User'} size="xl" />
          <span
            className={`absolute bottom-1 right-1 w-4 h-4 rounded-full ring-2 ring-slate-900 ${
              displayUser?.isOnline ? 'bg-emerald-500' : 'bg-slate-500'
            }`}
          />
        </div>

        <h2 className="text-lg font-bold text-white mb-1">{displayUser?.username}</h2>
        <StatusDot isOnline={displayUser?.isOnline} showText className="mb-6" />

        {/* Info Cards */}
        <div className="w-full space-y-4 text-left">
          {/* Email */}
          <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Email Address</span>
            </div>
            <p className="text-sm text-slate-200 truncate">{displayUser?.email}</p>
          </div>

          {/* Bio */}
          <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>About / Bio</span>
              </span>
              {isOwnProfile && !isEditingBio && (
                <button
                  onClick={() => {
                    setBioInput(displayUser?.bio || '');
                    setIsEditingBio(true);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
                >
                  <Edit3 className="w-3 h-3" /> Edit
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
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-lg p-2 text-xs text-white focus:outline-none"
                  placeholder="Write a brief bio..."
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => setIsEditingBio(false)}
                    className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBio}
                    disabled={savingBio}
                    className="px-2.5 py-1 text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed">
                {displayUser?.bio || 'No bio provided.'}
              </p>
            )}
          </div>

          {/* Member Since */}
          <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Joined</span>
            </div>
            <p className="text-xs text-slate-300">
              {displayUser?.createdAt ? format(new Date(displayUser.createdAt), 'MMMM yyyy') : 'Recently'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
