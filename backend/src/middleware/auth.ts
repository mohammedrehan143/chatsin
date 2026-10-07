import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth/authService';
import { userRepository } from '../repositories/UserRepository';
import { AppError } from '../utils/response';
import { User } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: Omit<User, 'passwordHash'>;
  token?: string;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication token missing or invalid format', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    const payload = authService.verifyToken(token);

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw new AppError('User belonging to this token no longer exists', 401, 'USER_NOT_FOUND');
    }

    const { passwordHash: _, ...safeUser } = user;
    req.user = safeUser;
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
}
