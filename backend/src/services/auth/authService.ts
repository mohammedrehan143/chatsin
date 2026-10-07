import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository, IUserRepository } from '../../repositories/UserRepository';
import { sessionRepository, ISessionRepository } from '../../repositories/SessionRepository';
import { eventPublisher } from '../events';
import { config } from '../../config';
import { AppError } from '../../utils/response';
import { User, AuthTokenPayload } from '../../types';

export class AuthService {
  constructor(
    private userRepo: IUserRepository = userRepository,
    private sessionRepo: ISessionRepository = sessionRepository
  ) {}

  async register(data: {
    phoneNumber?: string;
    email?: string;
    username?: string;
    password?: string;
  }): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const rawPhone = data.phoneNumber?.trim();
    const cleanPhone = rawPhone ? rawPhone.replace(/[^0-9+]/g, '') : undefined;
    const username = (data.username || (cleanPhone ? `user_${cleanPhone.replace(/[^0-9]/g, '').slice(-4)}` : `user_${Date.now()}`)).trim();
    const password = data.password || 'Password123!';

    // Check existing phone number if provided
    if (cleanPhone) {
      const existingPhone = await this.userRepo.findByPhone(cleanPhone);
      if (existingPhone) {
        throw new AppError('An account with this mobile number already exists', 409, 'PHONE_EXISTS');
      }
    }

    // Determine or generate unique email
    let email = data.email?.toLowerCase().trim();
    if (!email) {
      if (cleanPhone) {
        email = `${cleanPhone.replace('+', '')}@phone.chatapp`;
      } else {
        email = `${data.username.toLowerCase()}@user.chatapp`;
      }
    }

    const existingEmail = await this.userRepo.findByEmail(email);
    if (existingEmail) {
      throw new AppError('An account with this email/number already exists', 409, 'EMAIL_EXISTS');
    }

    const existingUsername = await this.userRepo.findByUsername(data.username);
    if (existingUsername) {
      throw new AppError('Username is already taken', 409, 'USERNAME_EXISTS');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await this.userRepo.create({
      email,
      username: data.username,
      phoneNumber: cleanPhone,
      passwordHash,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.username)}`
    });

    const token = this.generateToken({
      userId: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      username: user.username
    });

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30-day persistent session
    await this.sessionRepo.create(user.id, token, expiresAt);

    // Publish event
    await eventPublisher.publish('user_registered', {
      userId: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      username: user.username
    });

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  async login(data: {
    identifier: string; // Phone number, username, or email
    password: string;
  }): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const rawIdentifier = data.identifier.trim();
    let user: User | null = null;

    // 1. Try finding by phone if it looks like a phone number
    const digitsOnly = rawIdentifier.replace(/[^0-9+]/g, '');
    if (digitsOnly.length >= 7) {
      user = await this.userRepo.findByPhone(digitsOnly);
    }

    // 2. Try email if contains @
    if (!user && rawIdentifier.includes('@')) {
      user = await this.userRepo.findByEmail(rawIdentifier);
    }

    // 3. Try username
    if (!user) {
      user = await this.userRepo.findByUsername(rawIdentifier);
    }

    // 4. Try raw phone if not matched yet
    if (!user) {
      user = await this.userRepo.findByPhone(rawIdentifier);
    }

    if (!user || !user.passwordHash) {
      throw new AppError('Invalid credentials. Please check your mobile number or password.', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid credentials. Please check your mobile number or password.', 401, 'INVALID_CREDENTIALS');
    }

    const token = this.generateToken({
      userId: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      username: user.username
    });

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30-day persistent session
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
    return jwt.sign(payload, config.jwt.secret, { expiresIn: '30d' }); // 30d persistent token
  }
}

export const authService = new AuthService();
