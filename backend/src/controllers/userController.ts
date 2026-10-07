import { Response, NextFunction } from 'express';
import { userRepository } from '../repositories/UserRepository';
import { cacheService } from '../services/cache';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../utils/response';
import { z } from 'zod';

const updateProfileSchema = z.object({
  bio: z.string().max(250).optional(),
  avatarUrl: z.string().url().optional()
});

export class UserController {
  async searchUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req.query.q as string) || '';
      const currentUserId = req.user?.id;

      let users = await userRepository.search(query, currentUserId, 30);

      // Enhance with online status from cache abstraction
      const enriched = await Promise.all(
        users.map(async u => ({
          ...u,
          isOnline: await cacheService.isUserOnline(u.id)
        }))
      );

      sendSuccess(res, enriched, 200);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userRepository.findById(id);
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const { passwordHash: _, ...safeUser } = user;
      const isOnline = await cacheService.isUserOnline(id);

      sendSuccess(res, { ...safeUser, isOnline }, 200);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user!.id;
      const validated = updateProfileSchema.parse(req.body);

      const updated = await userRepository.update(currentUserId, validated);
      if (!updated) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const { passwordHash: _, ...safeUser } = updated;
      sendSuccess(res, safeUser, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
