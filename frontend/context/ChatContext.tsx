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
  deleteConversation: (conversationId: string) => Promise<void>;
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
  const [typingByConversation, setTypingByConversation] = useState<Record<string, string[]>>({});
  const typingTimeoutsRef = useRef<Record<string, Record<string, NodeJS.Timeout>>>({});
  const activeConvRef = useRef<Conversation | null>(null);
  const activeLoadConvIdRef = useRef<string | null>(null);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  // Active typing users strictly derived for the currently active conversation
  const typingUsers = React.useMemo(() => {
    if (!activeConversation) return [];
    return typingByConversation[activeConversation.id] || [];
  }, [activeConversation, typingByConversation]);

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
      activeLoadConvIdRef.current = convId;
      setLoadingMessages(true);
      const data = await api.getMessages(convId, 100);
      if (activeLoadConvIdRef.current === convId) {
        setMessages(data);
      }
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
      if (activeLoadConvIdRef.current === convId) {
        setLoadingMessages(false);
      }
    }
  }, []);

  const selectConversation = (conv: Conversation) => {
    setActiveConversation(conv);
    activeConvRef.current = conv;
    // Clear previous messages immediately so other contact's messages never display in new chat
    setMessages([]);
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

      // Clear typing indicator for message sender in this conversation
      if (message.conversationId && message.sender?.username) {
        const uname = message.sender.username;
        if (typingTimeoutsRef.current[message.conversationId]?.[uname]) {
          clearTimeout(typingTimeoutsRef.current[message.conversationId][uname]);
          delete typingTimeoutsRef.current[message.conversationId][uname];
        }
        setTypingByConversation(prev => {
          const current = prev[message.conversationId] || [];
          if (!current.includes(uname)) return prev;
          return {
            ...prev,
            [message.conversationId]: current.filter(u => u !== uname),
          };
        });
      }

      // Update message list if in active conversation
      if (currentActive && currentActive.id === message.conversationId) {
        setMessages(prev => {
          // 1. If permanent message ID is already present, do not duplicate
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          // 2. If optimistic message with clientTempId exists, replace it in-place
          if (clientTempId && prev.some(m => m.clientTempId === clientTempId)) {
            return prev.map(m => (m.clientTempId === clientTempId ? message : m));
          }
          // 3. Fallback match by content and sender
          const tempIdx = prev.findIndex(m =>
            m.id.startsWith('temp-') &&
            m.conversationId === message.conversationId &&
            m.senderId === message.senderId &&
            m.content === message.content
          );
          if (tempIdx !== -1) {
            const next = [...prev];
            next[tempIdx] = message;
            return next;
          }
          // 4. Otherwise append new incoming message
          return [...prev, message];
        });

        // Mark read immediately if not sent by us
        if (message.senderId !== user.id) {
          socket.emit('mark_read', { conversationId: message.conversationId });
        }
      }

      // Audio notification and tab title badge when someone sends a message (only if window unfocused or in other chat)
      if (message.senderId !== user.id && !processedMessageIdsRef.current.has(message.id)) {
        processedMessageIdsRef.current.add(message.id);
        if (processedMessageIdsRef.current.size > 300) {
          const first = processedMessageIdsRef.current.values().next().value;
          if (first) processedMessageIdsRef.current.delete(first);
        }
        const isCurrentlyViewingThisConv =
          typeof document !== 'undefined' &&
          document.hasFocus() &&
          activeConvRef.current?.id === message.conversationId;
        if (!isCurrentlyViewingThisConv) {
          playNotificationSound();
          notifyDocumentTitle(message.sender?.username || 'Contact');
        }
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
      if (!payload.conversationId || !payload.username || payload.userId === user.id) return;
      const { conversationId, username } = payload;

      setTypingByConversation(prev => {
        const current = prev[conversationId] || [];
        if (current.includes(username)) return prev;
        return {
          ...prev,
          [conversationId]: [...current, username],
        };
      });

      // Auto-expire timer for 3 seconds
      if (!typingTimeoutsRef.current[conversationId]) {
        typingTimeoutsRef.current[conversationId] = {};
      }
      if (typingTimeoutsRef.current[conversationId][username]) {
        clearTimeout(typingTimeoutsRef.current[conversationId][username]);
      }
      typingTimeoutsRef.current[conversationId][username] = setTimeout(() => {
        setTypingByConversation(prev => {
          const current = prev[conversationId] || [];
          const filtered = current.filter(u => u !== username);
          return { ...prev, [conversationId]: filtered };
        });
      }, 3000);
    };

    const handleUserStoppedTyping = (payload: TypingEvent) => {
      if (!payload.conversationId || !payload.username) return;
      const { conversationId, username } = payload;

      if (typingTimeoutsRef.current[conversationId]?.[username]) {
        clearTimeout(typingTimeoutsRef.current[conversationId][username]);
        delete typingTimeoutsRef.current[conversationId][username];
      }

      setTypingByConversation(prev => {
        const current = prev[conversationId] || [];
        if (!current.includes(username)) return prev;
        return {
          ...prev,
          [conversationId]: current.filter(u => u !== username),
        };
      });
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

      // Clear all active typing timeouts on unmount or socket recreate
      Object.values(typingTimeoutsRef.current).forEach(userMap => {
        Object.values(userMap).forEach(timer => clearTimeout(timer));
      });
      typingTimeoutsRef.current = {};
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
        setMessages(prev => {
          if (prev.some(m => m.id === saved.id)) {
            return prev.filter(m => m.clientTempId !== tempId && m.id !== tempId);
          }
          return prev.map(m => (m.clientTempId === tempId || m.id === tempId ? saved : m));
        });
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

  const deleteConversation = async (conversationId: string): Promise<void> => {
    await api.deleteConversation(conversationId);
    // If active conversation is the one being deleted, deselect it
    if (activeConvRef.current?.id === conversationId) {
      setActiveConversation(null);
      setMessages([]);
    }
    setConversations(prev => prev.filter(c => c.id !== conversationId));
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
        deleteConversation,
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
