import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth/authService';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username max 30 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required')
});

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await authService.register(validated);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await authService.login(validated);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.token) {
        await authService.logout(req.token);
      }
      sendSuccess(res, { message: 'Logged out successfully' }, 200);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, { user: req.user }, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
