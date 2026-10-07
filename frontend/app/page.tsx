'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { NavRail, NavTab } from '../components/chat/NavRail';
import { Sidebar } from '../components/chat/Sidebar';
import { GroupsPanel } from '../components/chat/GroupsPanel';
import { CommunitiesPanel } from '../components/chat/CommunitiesPanel';
import { StatusPanel } from '../components/chat/StatusPanel';
import { SettingsPanel } from '../components/chat/SettingsPanel';
import { ChatWindow } from '../components/chat/ChatWindow';
import { UserProfilePanel } from '../components/chat/UserProfilePanel';
import { UserSearchModal } from '../components/chat/UserSearchModal';
import { DownloadAppModal } from '../components/chat/DownloadAppModal';
import { MessageSquareText } from 'lucide-react';

export default function ChatAppPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { activeConversation, selectConversation } = useChat();

  const [activeTab, setActiveTab] = useState<NavTab>('chats');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
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

  // Proactive "Download App / Chrome Extension" popup prompt after login (if not previously dismissed)
  useEffect(() => {
    if (!loading && user && !showSplash) {
      try {
        const dismissed = localStorage.getItem('chatsin_hide_install_popup') === 'true';
        if (!dismissed) {
          const popupTimer = setTimeout(() => {
            setIsDownloadOpen(true);
          }, 1800);
          return () => clearTimeout(popupTimer);
        }
      } catch {}
    }
  }, [loading, user, showSplash]);

  // When switching tabs away from chats, deselect conversation on mobile
  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
  };

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

  // Whether to show the left panel (sidebar+navrail area) on mobile
  const showLeftPanel = activeTab !== 'chats' || !activeConversation;
  // Whether to show chat window
  const showChatWindow = activeTab === 'chats';

  return (
    <div className="h-screen w-screen bg-[#f4f4f5] relative flex items-center justify-center overflow-hidden font-sans">
      {/* Top Black Minimalist Accent for Large Displays */}
      <div className="hidden xl:block absolute top-0 left-0 right-0 h-28 bg-[#09090b] -z-0" />

      {/* Main Application Window */}
      <div className="relative z-10 w-full h-full xl:h-[calc(100vh-36px)] xl:max-w-[1650px] bg-white xl:rounded-2xl shadow-2xl border-0 xl:border border-[#e4e4e7] overflow-hidden flex animate-fade-in">

        {/* ── Left nav area: NavRail + panel ── */}
        <div className={`h-full flex ${showLeftPanel ? 'flex' : 'hidden md:flex'} ${activeConversation && activeTab === 'chats' ? 'hidden md:flex' : ''}`}>
          {/* Vertical Icon Nav Rail */}
          <NavRail
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onOpenProfile={() => {
              setTargetProfileUser(user);
              setIsProfileOpen(true);
            }}
          />

          {/* Panel content based on active tab */}
          {activeTab === 'chats' && (
            <Sidebar
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenProfile={() => {
                setTargetProfileUser(user);
                setIsProfileOpen(true);
              }}
              onOpenDownload={() => setIsDownloadOpen(true)}
            />
          )}
          {activeTab === 'groups' && <GroupsPanel onOpenSearch={() => setIsSearchOpen(true)} />}
          {activeTab === 'communities' && <CommunitiesPanel />}
          {activeTab === 'status' && <StatusPanel />}
          {activeTab === 'settings' && (
            <SettingsPanel
              onOpenProfile={() => {
                setTargetProfileUser(user);
                setIsProfileOpen(true);
              }}
              onOpenDownload={() => setIsDownloadOpen(true)}
            />
          )}
        </div>

        {/* ── Main Chat Window (only visible on chats tab) ── */}
        {showChatWindow && (
          <div className={`h-full flex-1 ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
            <ChatWindow
              onBackMobile={() => selectConversation(null as any)}
              onOpenProfile={() => {
                setTargetProfileUser(activeConversation?.participant);
                setIsProfileOpen(true);
              }}
            />
          </div>
        )}

        {/* Non-chat tab: fill remaining space with placeholder */}
        {!showChatWindow && (
          <div className="hidden md:flex flex-1 h-full flex-col items-center justify-center bg-[#fafafa] text-center select-none px-8">
            <div className="w-20 h-20 bg-[#09090b] rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl border border-zinc-800">
              <MessageSquareText className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-[#09090b]">Chatsin</h3>
            <p className="text-xs text-[#71717a] mt-2 max-w-sm leading-relaxed">
              {activeTab === 'groups' && 'Select a group to start chatting with multiple people at once.'}
              {activeTab === 'communities' && 'Join or create a community to broadcast announcements and updates.'}
              {activeTab === 'status' && 'Tap a contact\'s status to view their update.'}
              {activeTab === 'settings' && 'Manage your account, privacy, and preferences.'}
            </p>
          </div>
        )}

        {/* 3. User Profile Panel */}
        {isProfileOpen && (
          <UserProfilePanel
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            targetUserOverride={targetProfileUser}
            onOpenDownload={() => setIsDownloadOpen(true)}
          />
        )}

        {/* 4. Search & New Chat Dialog */}
        <UserSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />

        {/* 5. Download App / Chrome Extension Modal */}
        <DownloadAppModal
          isOpen={isDownloadOpen}
          onClose={() => setIsDownloadOpen(false)}
        />
      </div>
    </div>
  );
}
