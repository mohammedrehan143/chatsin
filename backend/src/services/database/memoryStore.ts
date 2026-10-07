import { User, Conversation, ConversationMember, Message, MessageRead, Session } from '../../types';

class MemoryStore {
  public users: Map<string, User> = new Map();
  public sessions: Map<string, Session> = new Map();
  public conversations: Map<string, Conversation> = new Map();
  public conversationMembers: ConversationMember[] = [];
  public messages: Map<string, Message> = new Map();
  public messageReads: MessageRead[] = [];

  public clear() {
    this.users.clear();
    this.sessions.clear();
    this.conversations.clear();
    this.conversationMembers = [];
    this.messages.clear();
    this.messageReads = [];
  }
}

export const memoryStore = new MemoryStore();
