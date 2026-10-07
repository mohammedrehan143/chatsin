import { EventEmitter } from 'events';
import crypto from 'crypto';
import { ChatEventType, ChatEvent, EventHandler, IEventPublisher } from './IEventPublisher';

export class LocalEventPublisher implements IEventPublisher {
  private emitter: EventEmitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(100);
  }

  async publish<T>(eventType: ChatEventType, payload: T): Promise<void> {
    const event: ChatEvent<T> = {
      id: crypto.randomUUID(),
      type: eventType,
      timestamp: new Date().toISOString(),
      payload
    };

    // Log event for audit and local debugging
    console.log(`[EventPublisher:Local] Emitted '${eventType}':`, JSON.stringify(payload));
    this.emitter.emit(eventType, event);
  }

  subscribe<T>(eventType: ChatEventType, handler: EventHandler<T>): () => void {
    this.emitter.on(eventType, handler);
    return () => {
      this.emitter.off(eventType, handler);
    };
  }
}

export const localEventPublisher = new LocalEventPublisher();
