import { PrismaClient } from '@prisma/client';
import { config } from '../../config';

let prisma: PrismaClient | null = null;
let isPrismaConnected = false;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = getPrismaClient();
    await client.$connect();
    // Test query
    await client.$queryRaw`SELECT 1`;
    isPrismaConnected = true;
    console.log('[Database] Connected to PostgreSQL database successfully.');
    return true;
  } catch (error: any) {
    isPrismaConnected = false;
    console.warn('[Database] PostgreSQL connection failed or unavailable:', error.message);
    console.warn('[Database] Falling back to high-fidelity In-Memory Database store for development.');
    return false;
  }
}

export function isDatabaseConnected(): boolean {
  return isPrismaConnected;
}
