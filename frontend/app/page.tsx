'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { Sidebar } from '../components/chat/Sidebar';
import { ChatWindow } from '../components/chat/ChatWindow';
import { UserProfilePanel } from '../components/chat/UserProfilePanel';
import { UserSearchModal } from '../components/chat/UserSearchModal';
import { MessageCircle } from 'lucide-react';

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
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#efeae2] text-[#111b21] select-none">
        <div className="w-16 h-16 bg-[#00a884] rounded-full flex items-center justify-center text-white shadow-lg mb-6 animate-pulse">
          <MessageCircle className="w-9 h-9 fill-white" />
        </div>
        <div className="w-8 h-8 border-3 border-[#00a884] border-t-transparent rounded-full animate-spin mb-3" />
        <h2 className="text-base font-semibold text-[#111b21]">WhatsApp Web</h2>
        <p className="text-xs text-[#667781] mt-1">End-to-end encrypted messaging</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#d1d7db] relative flex items-center justify-center overflow-hidden font-sans">
      {/* Top Green Bar for Desktop */}
      <div className="hidden xl:block absolute top-0 left-0 right-0 h-32 bg-[#00a884] -z-0" />

      {/* Main Application Window */}
      <div className="relative z-10 w-full h-full xl:h-[calc(100vh-38px)] xl:max-w-[1650px] bg-white xl:rounded-xl shadow-2xl border-0 xl:border border-[#e9edef] overflow-hidden flex">
        {/* 1. Sidebar (WhatsApp conversation list & search) */}
        <div className={`h-full ${activeConversation ? 'hidden md:flex' : 'flex w-full md:w-auto'}`}>
          <Sidebar
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenProfile={() => {
              setTargetProfileUser(user);
              setIsProfileOpen(true);
            }}
          />
        </div>

        {/* 2. Main Chat Window */}
        <div className={`h-full flex-1 ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
          <ChatWindow
            onBackMobile={() => selectConversation(null as any)}
            onOpenProfile={() => {
              setTargetProfileUser(activeConversation?.participant);
              setIsProfileOpen(true);
            }}
          />
        </div>

        {/* 3. User Profile Panel (WhatsApp Contact Info drawer) */}
        {isProfileOpen && (
          <UserProfilePanel
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            targetUserOverride={targetProfileUser}
          />
        )}

        {/* 4. Search & New Chat Dialog */}
        <UserSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      </div>
    </div>
  );
}
