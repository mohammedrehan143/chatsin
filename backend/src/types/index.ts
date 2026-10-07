export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash?: string;
  avatarUrl: string | null;
  bio: string | null;
  isOnline?: boolean;
  lastSeen?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date | string;
  createdAt: Date | string;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  members?: ConversationMember[];
  lastMessage?: Message | null;
  unreadCount?: number;
}

export interface ConversationMember {
  conversationId: string;
  userId: string;
  joinedAt: Date | string;
  user?: User;
}

export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: MessageStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  sender?: User;
}

export interface MessageRead {
  messageId: string;
  userId: string;
  readAt: Date | string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  username: string;
}
