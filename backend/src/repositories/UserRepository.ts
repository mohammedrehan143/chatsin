import { User } from '../types';
import { getPrismaClient, isDatabaseConnected } from '../services/database';
import { memoryStore } from '../services/database/memoryStore';
import crypto from 'crypto';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  create(data: { email: string; username: string; passwordHash: string; phoneNumber?: string; avatarUrl?: string; bio?: string }): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User | null>;
  search(query: string, excludeUserId?: string, limit?: number): Promise<User[]>;
  getAll(limit?: number): Promise<User[]>;
}

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    if (isDatabaseConnected()) {
      try {
        const user = await getPrismaClient().user.findUnique({ where: { id } });
        return user as User | null;
      } catch (err) {
        console.warn('[UserRepository] Prisma findById error, checking memoryStore', err);
      }
    }
    return memoryStore.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();
    if (isDatabaseConnected()) {
      try {
        const user = await getPrismaClient().user.findUnique({ where: { email: normalizedEmail } });
        return user as User | null;
      } catch (err) {
        console.warn('[UserRepository] Prisma findByEmail error', err);
      }
    }
    for (const u of memoryStore.users.values()) {
      if (u.email && u.email.toLowerCase() === normalizedEmail) return u;
    }
    return null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const normalized = username.toLowerCase().trim();
    if (isDatabaseConnected()) {
      try {
        const user = await getPrismaClient().user.findUnique({ where: { username: normalized } });
        return user as User | null;
      } catch (err) {
        console.warn('[UserRepository] Prisma findByUsername error', err);
      }
    }
    for (const u of memoryStore.users.values()) {
      if (u.username.toLowerCase() === normalized) return u;
    }
    return null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const normalizedPhone = phone.replace(/[^0-9+]/g, '');
    if (isDatabaseConnected()) {
      try {
        const user = await getPrismaClient().user.findUnique({ where: { phoneNumber: normalizedPhone } });
        return user as User | null;
      } catch (err) {
        console.warn('[UserRepository] Prisma findByPhone error', err);
      }
    }
    for (const u of memoryStore.users.values()) {
      if (u.phoneNumber && u.phoneNumber.replace(/[^0-9+]/g, '') === normalizedPhone) return u;
    }
    return null;
  }

  async create(data: { email: string; username: string; passwordHash: string; phoneNumber?: string; avatarUrl?: string; bio?: string }): Promise<User> {
    const email = data.email.toLowerCase().trim();
    const username = data.username.trim();
    const phoneNumber = data.phoneNumber ? data.phoneNumber.replace(/[^0-9+]/g, '') : null;

    if (isDatabaseConnected()) {
      try {
        const created = await getPrismaClient().user.create({
          data: {
            email,
            username,
            passwordHash: data.passwordHash,
            phoneNumber,
            avatarUrl: data.avatarUrl || null,
            bio: data.bio || null
          }
        });
        return created as User;
      } catch (err) {
        console.warn('[UserRepository] Prisma create error, falling back to memory', err);
      }
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      username,
      phoneNumber,
      passwordHash: data.passwordHash,
      avatarUrl: data.avatarUrl || null,
      bio: data.bio || null,
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.users.set(newUser.id, newUser);
    return newUser;
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    if (isDatabaseConnected()) {
      try {
        const updated = await getPrismaClient().user.update({
          where: { id },
          data: {
            ...(data.phoneNumber !== undefined ? { phoneNumber: data.phoneNumber } : {}),
            ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
            ...(data.bio !== undefined ? { bio: data.bio } : {}),
            ...(data.lastSeen !== undefined ? { lastSeen: new Date(data.lastSeen) } : {})
          }
        });
        return updated as User;
      } catch (err) {
        console.warn('[UserRepository] Prisma update error', err);
      }
    }

    const existing = memoryStore.users.get(id);
    if (!existing) return null;
    const updatedUser: User = {
      ...existing,
      ...data,
      updatedAt: new Date()
    };
    memoryStore.users.set(id, updatedUser);
    return updatedUser;
  }

  async search(query: string, excludeUserId?: string, limit = 50): Promise<User[]> {
    const q = query.toLowerCase().trim();
    const digitsOnly = query.replace(/[^0-9]/g, '');

    if (isDatabaseConnected()) {
      try {
        const whereClause: any = {};
        if (excludeUserId) {
          whereClause.id = { not: excludeUserId };
        }

        if (q) {
          const orConditions: any[] = [
            { username: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } }
          ];
          if (digitsOnly) {
            orConditions.push({ phoneNumber: { contains: digitsOnly } });
          }
          if (q.length > 2) {
            orConditions.push({ phoneNumber: { contains: q } });
          }
          whereClause.OR = orConditions;
        }

        const users = await getPrismaClient().user.findMany({
          where: whereClause,
          take: limit,
          orderBy: { createdAt: 'desc' }
        });
        return users.map(u => {
          const { passwordHash, ...rest } = u;
          return rest as User;
        });
      } catch (err) {
        console.warn('[UserRepository] Prisma search error', err);
      }
    }

    const results: User[] = [];
    for (const u of memoryStore.users.values()) {
      if (excludeUserId && u.id === excludeUserId) continue;
      if (!q) {
        const { passwordHash, ...safeUser } = u;
        results.push(safeUser as User);
        if (results.length >= limit) break;
        continue;
      }
      const matchUsername = u.username.toLowerCase().includes(q);
      const matchEmail = u.email && u.email.toLowerCase().includes(q);
      const matchPhone = (digitsOnly && u.phoneNumber && u.phoneNumber.includes(digitsOnly)) || (u.phoneNumber && u.phoneNumber.toLowerCase().includes(q));

      if (matchUsername || matchEmail || matchPhone) {
        const { passwordHash, ...safeUser } = u;
        results.push(safeUser as User);
        if (results.length >= limit) break;
      }
    }
    return results;
  }

  async getAll(limit = 50): Promise<User[]> {
    if (isDatabaseConnected()) {
      try {
        const users = await getPrismaClient().user.findMany({
          take: limit,
          orderBy: { createdAt: 'desc' }
        });
        return users.map(u => {
          const { passwordHash, ...safe } = u;
          return safe as User;
        });
      } catch (err) {
        console.warn('[UserRepository] Prisma getAll error', err);
      }
    }

    const list: User[] = [];
    for (const u of memoryStore.users.values()) {
      const { passwordHash, ...safe } = u;
      list.push(safe as User);
      if (list.length >= limit) break;
    }
    return list;
  }
}

export const userRepository = new UserRepository();
