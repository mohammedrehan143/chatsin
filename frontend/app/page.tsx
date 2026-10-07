'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { Sidebar } from '../components/chat/Sidebar';
import { ChatWindow } from '../components/chat/ChatWindow';
import { UserProfilePanel } from '../components/chat/UserProfilePanel';
import { UserSearchModal } from '../components/chat/UserSearchModal';

export default function ChatAppPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { activeConversation, selectConversation } = useChat();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [targetProfileUser, setTargetProfileUser] = useState<any>(null);

  // Authentication Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">Loading messaging workspace...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-slate-950 overflow-hidden font-sans">
      {/* 1. Sidebar (Visible on desktop; or on mobile if NO conversation is selected) */}
      <div className={`h-full ${activeConversation ? 'hidden md:flex' : 'flex w-full md:w-auto'}`}>
        <Sidebar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenProfile={() => {
            setTargetProfileUser(user);
            setIsProfileOpen(true);
          }}
        />
      </div>

      {/* 2. Main Chat Window (Visible on desktop; or on mobile if conversation IS selected) */}
      <div className={`h-full flex-1 ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
        <ChatWindow
          onBackMobile={() => selectConversation(null as any)}
          onOpenProfile={() => {
            setTargetProfileUser(activeConversation?.participant);
            setIsProfileOpen(true);
          }}
        />
      </div>

      {/* 3. User Profile Panel (Desktop 3rd Pane / Drawer) */}
      {isProfileOpen && (
        <UserProfilePanel
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          targetUserOverride={targetProfileUser}
        />
      )}

      {/* 4. Search & New Chat Modal */}
      <UserSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
