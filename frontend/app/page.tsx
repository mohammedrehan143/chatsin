'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { Sidebar } from '../components/chat/Sidebar';
import { ChatWindow } from '../components/chat/ChatWindow';
import { UserProfilePanel } from '../components/chat/UserProfilePanel';
import { UserSearchModal } from '../components/chat/UserSearchModal';
import { MessageSquareText } from 'lucide-react';

export default function ChatAppPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { activeConversation, selectConversation } = useChat();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [targetProfileUser, setTargetProfileUser] = useState<any>(null);
  const [showSplash, setShowSplash] = useState(true);

  // Authentication Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Initial Starting Animation Duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  // Starting Animation & Loading Splash Screen
  if (loading || !user || showSplash) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#fafafa] text-[#09090b] select-none transition-all duration-500">
        <div className="w-20 h-20 bg-[#09090b] rounded-3xl flex items-center justify-center text-white shadow-2xl mb-6 animate-splash-glow">
          <MessageSquareText className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#09090b] mb-1">Chatsin</h1>
        <p className="text-xs text-[#71717a] font-medium tracking-wide uppercase mb-6">
          Real-Time Messaging
        </p>
        <div className="w-44 h-1 bg-[#e4e4e7] rounded-full overflow-hidden">
          <div className="h-full bg-[#09090b] rounded-full animate-progress-line" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#f4f4f5] relative flex items-center justify-center overflow-hidden font-sans">
      {/* Top Black Minimalist Accent for Large Displays */}
      <div className="hidden xl:block absolute top-0 left-0 right-0 h-28 bg-[#09090b] -z-0" />

      {/* Main Application Window */}
      <div className="relative z-10 w-full h-full xl:h-[calc(100vh-36px)] xl:max-w-[1650px] bg-white xl:rounded-2xl shadow-2xl border-0 xl:border border-[#e4e4e7] overflow-hidden flex animate-fade-in">
        {/* 1. Sidebar (Chatsin conversation list & contact search) */}
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

        {/* 3. User Profile Panel (Chatsin Profile drawer) */}
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
