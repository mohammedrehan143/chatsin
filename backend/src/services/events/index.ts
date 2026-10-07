import { IEventPublisher } from './IEventPublisher';
import { localEventPublisher } from './LocalEventPublisher';

export * from './IEventPublisher';
export * from './LocalEventPublisher';

// Active event publisher instance (cleanly swappable for Aiven Kafka in production)
export const eventPublisher: IEventPublisher = localEventPublisher;
