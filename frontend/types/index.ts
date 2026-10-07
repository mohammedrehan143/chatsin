export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  isOnline?: boolean;
  lastSeen?: string;
  createdAt: string;
}

export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  sender?: User;
  clientTempId?: string;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  updatedAt: string;
  lastMessage?: Message | null;
  unreadCount: number;
  participant?: User | null;
}

export interface TypingEvent {
  conversationId: string;
  userId: string;
  username: string;
}
