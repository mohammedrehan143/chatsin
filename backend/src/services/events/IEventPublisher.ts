export type ChatEventType =
  | 'message_sent'
  | 'message_edited'
  | 'message_deleted'
  | 'message_read'
  | 'message_delivered'
  | 'user_online'
  | 'user_offline'
  | 'user_registered';

export interface ChatEvent<T = any> {
  id: string;
  type: ChatEventType;
  timestamp: string;
  payload: T;
}

export type EventHandler<T = any> = (event: ChatEvent<T>) => void | Promise<void>;

export interface IEventPublisher {
  publish<T>(eventType: ChatEventType, payload: T): Promise<void>;
  subscribe<T>(eventType: ChatEventType, handler: EventHandler<T>): () => void;
}
