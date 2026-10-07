'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { Conversation, Message, User, TypingEvent } from '../types';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import { useAuth } from './AuthContext';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  typingUsers: string[];
  selectConversation: (conversation: Conversation) => void;
  sendMessage: (content: string) => Promise<void>;
  sendTyping: (isTyping: boolean) => void;
  startDirectConversation: (recipient: User) => Promise<Conversation>;
  refreshConversations: () => Promise<void>;
}

function playNotificationSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, ctx.currentTime);
    osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Autoplay policy or unavailable audio context
  }
}

function notifyDocumentTitle(senderName: string) {
  if (typeof document === 'undefined') return;
  const original = 'Chatsin | Real-Time Messaging';
  document.title = `💬 (1) ${senderName}: New message`;
  const clear = () => {
    document.title = original;
    window.removeEventListener('focus', clear);
    window.removeEventListener('click', clear);
  };
  window.addEventListener('focus', clear);
  window.addEventListener('click', clear);
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const activeConvRef = useRef<Conversation | null>(null);

  // Sync ref for socket listeners
  useEffect(() => {
    activeConvRef.current = activeConversation;
  }, [activeConversation]);

  // Load user conversations
  const refreshConversations = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingConversations(true);
      const data = await api.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      refreshConversations();
    } else {
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
    }
  }, [token, refreshConversations]);

  // Load messages when active conversation changes
  const loadMessages = useCallback(async (convId: string) => {
    try {
      setLoadingMessages(true);
      const data = await api.getMessages(convId, 100);
      setMessages(data);
      // Mark read via API and socket
      await api.markAsRead(convId);
      const s = getSocket();
      if (s) {
        s.emit('mark_read', { conversationId: convId });
      }
      // Clear unread count locally in list
      setConversations(prev =>
        prev.map(c => (c.id === convId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const selectConversation = (conv: Conversation) => {
    setActiveConversation(conv);
    loadMessages(conv.id);
    const s = getSocket();
    if (s) {
      s.emit('join_conversation', { conversationId: conv.id });
    }
  };

  // Socket setup & real-time event listeners
  useEffect(() => {
    if (!token || !user) return;
    const socket = getSocket(token);
    if (!socket) return;

    const handleNewMessage = (payload: { message: Message; clientTempId?: string }) => {
      const { message, clientTempId } = payload;
      const currentActive = activeConvRef.current;

      // Update message list if in active conversation
      if (currentActive && currentActive.id === message.conversationId) {
        setMessages(prev => {
          // Replace optimistic message if matching clientTempId
          if (clientTempId) {
            const filtered = prev.filter(m => m.clientTempId !== clientTempId);
            return [...filtered, message];
          }
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });

        // Mark read immediately if not sent by us
        if (message.senderId !== user.id) {
          socket.emit('mark_read', { conversationId: message.conversationId });
        }
      }

      // Audio notification and tab title badge when someone sends a message
      if (message.senderId !== user.id) {
        playNotificationSound();
        notifyDocumentTitle(message.sender?.username || 'Contact');
      }

      // Update conversations list preview & unread counts
      setConversations(prev => {
        const found = prev.find(c => c.id === message.conversationId);
        if (!found) {
          // Trigger full reload if new conversation unknown to client
          refreshConversations();
          return prev;
        }

        const isViewing = currentActive && currentActive.id === message.conversationId;
        const updated = prev.map(c => {
          if (c.id === message.conversationId) {
            return {
              ...c,
              lastMessage: message,
              unreadCount: isViewing || message.senderId === user.id ? 0 : c.unreadCount + 1,
              updatedAt: message.createdAt,
            };
          }
          return c;
        });

        // Move active conversation to top of list
        return updated.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    };

    const handleUserStatus = (payload: { userId: string; isOnline: boolean; lastSeen?: string }) => {
      setConversations(prev =>
        prev.map(c => {
          if (c.participant?.id === payload.userId) {
            return {
              ...c,
              participant: {
                ...c.participant,
                isOnline: payload.isOnline,
                lastSeen: payload.lastSeen || c.participant.lastSeen,
              },
            };
          }
          return c;
        })
      );

      // Also update active conversation participant
      setActiveConversation(prev => {
        if (prev?.participant?.id === payload.userId) {
          return {
            ...prev,
            participant: {
              ...prev.participant,
              isOnline: payload.isOnline,
              lastSeen: payload.lastSeen || prev.participant.lastSeen,
            },
          };
        }
        return prev;
      });
    };

    const handleUserTyping = (payload: TypingEvent) => {
      if (activeConvRef.current?.id === payload.conversationId && payload.userId !== user.id) {
        setTypingUsers(prev => Array.from(new Set([...prev, payload.username])));
      }
    };

    const handleUserStoppedTyping = (payload: TypingEvent) => {
      if (activeConvRef.current?.id === payload.conversationId) {
        setTypingUsers(prev => prev.filter(name => name !== payload.username));
      }
    };

    const handleMessagesRead = (payload: { conversationId: string; readerId: string; messageIds: string[] }) => {
      if (activeConvRef.current?.id === payload.conversationId) {
        setMessages(prev =>
          prev.map(m => (payload.messageIds.includes(m.id) ? { ...m, status: 'READ' } : m))
        );
      }
    };

    const handleConversationUpdated = () => {
      refreshConversations();
    };

    socket.on('new_message', handleNewMessage);
    socket.on('new_conversation', handleConversationUpdated);
    socket.on('conversation_updated', handleConversationUpdated);
    socket.on('user_status_changed', handleUserStatus);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('new_conversation', handleConversationUpdated);
      socket.off('conversation_updated', handleConversationUpdated);
      socket.off('user_status_changed', handleUserStatus);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [token, user, refreshConversations]);

  // Send message
  const sendMessage = async (content: string) => {
    if (!activeConversation || !user) return;
    const trimmed = content.trim();
    if (!trimmed) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      clientTempId: tempId,
      conversationId: activeConversation.id,
      senderId: user.id,
      content: trimmed,
      status: 'SENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: user,
    };

    // Optimistic UI append
    setMessages(prev => [...prev, optimisticMessage]);

    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('send_message', {
        conversationId: activeConversation.id,
        content: trimmed,
        clientTempId: tempId,
      });
    } else {
      // Fallback to REST API
      try {
        const saved = await api.sendMessage(activeConversation.id, trimmed);
        setMessages(prev => prev.map(m => (m.clientTempId === tempId ? saved : m)));
      } catch (err) {
        console.error('Failed to send message via REST', err);
      }
    }
  };

  const sendTyping = (isTyping: boolean) => {
    if (!activeConversation) return;
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit(isTyping ? 'typing_start' : 'typing_stop', {
        conversationId: activeConversation.id,
      });
    }
  };

  const startDirectConversation = async (recipient: User): Promise<Conversation> => {
    const rawConv = await api.createDirectConversation(recipient.id);
    const formattedConv: Conversation = {
      id: rawConv.id,
      isGroup: false,
      updatedAt: rawConv.updatedAt,
      unreadCount: 0,
      participant: recipient,
    };

    setConversations(prev => {
      if (prev.some(c => c.id === formattedConv.id)) return prev;
      return [formattedConv, ...prev];
    });

    selectConversation(formattedConv);
    return formattedConv;
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        loadingConversations,
        loadingMessages,
        typingUsers,
        selectConversation,
        sendMessage,
        sendTyping,
        startDirectConversation,
        refreshConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
