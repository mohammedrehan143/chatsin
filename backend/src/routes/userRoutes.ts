import { Router } from 'express';
import { userController } from '../controllers/userController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res, next) => userController.searchUsers(req as any, res, next));
router.get('/:id', (req, res, next) => userController.getUserById(req as any, res, next));
router.patch('/profile', (req, res, next) => userController.updateProfile(req as any, res, next));

export default router;
