import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository, IUserRepository } from '../../repositories/UserRepository';
import { sessionRepository, ISessionRepository } from '../../repositories/SessionRepository';
import { eventPublisher } from '../events';
import { cacheService } from '../cache';
import { config } from '../../config';
import { AppError } from '../../utils/response';
import { User, AuthTokenPayload } from '../../types';

export class AuthService {
  constructor(
    private userRepo: IUserRepository = userRepository,
    private sessionRepo: ISessionRepository = sessionRepository
  ) {}

  async register(data: { email: string; username: string; password: string }): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const existingEmail = await this.userRepo.findByEmail(data.email);
    if (existingEmail) {
      throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS');
    }

    const existingUsername = await this.userRepo.findByUsername(data.username);
    if (existingUsername) {
      throw new AppError('Username is already taken', 409, 'USERNAME_EXISTS');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await this.userRepo.create({
      email: data.email,
      username: data.username,
      passwordHash,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.username)}`
    });

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      username: user.username
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.sessionRepo.create(user.id, token, expiresAt);

    // Publish event
    await eventPublisher.publish('user_registered', {
      userId: user.id,
      email: user.email,
      username: user.username
    });

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  async login(data: { emailOrUsername: string; password: string }): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    let user: User | null = null;
    if (data.emailOrUsername.includes('@')) {
      user = await this.userRepo.findByEmail(data.emailOrUsername);
    } else {
      user = await this.userRepo.findByUsername(data.emailOrUsername);
    }

    if (!user || !user.passwordHash) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      username: user.username
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.sessionRepo.create(user.id, token, expiresAt);

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  async logout(token: string): Promise<void> {
    await this.sessionRepo.deleteByToken(token);
  }

  verifyToken(token: string): AuthTokenPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as AuthTokenPayload;
    } catch (err) {
      throw new AppError('Invalid or expired authentication token', 401, 'UNAUTHORIZED');
    }
  }

  private generateToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, config.jwt.secret, { expiresIn: '7d' });
  }
}

export const authService = new AuthService();
