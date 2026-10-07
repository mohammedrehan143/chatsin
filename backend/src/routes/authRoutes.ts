import { Router } from 'express';
import { authController } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/logout', requireAuth, (req, res, next) => authController.logout(req as any, res, next));
router.get('/me', requireAuth, (req, res, next) => authController.getMe(req as any, res, next));

export default router;
