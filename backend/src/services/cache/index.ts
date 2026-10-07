import { ICacheService } from './ICacheService';
import { inMemoryCacheService } from './InMemoryCacheService';

export * from './ICacheService';
export * from './InMemoryCacheService';

// Active cache service instance (cleanly swappable for Aiven Valkey in production)
export const cacheService: ICacheService = inMemoryCacheService;
