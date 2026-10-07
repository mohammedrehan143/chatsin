import { Router } from 'express';
import { conversationController } from '../controllers/conversationController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res, next) => conversationController.getMyConversations(req as any, res, next));
router.post('/', (req, res, next) => conversationController.createDirectConversation(req as any, res, next));
router.get('/:id/messages', (req, res, next) => conversationController.getMessages(req as any, res, next));
router.post('/:id/messages', (req, res, next) => conversationController.sendMessage(req as any, res, next));
router.post('/:id/read', (req, res, next) => conversationController.markAsRead(req as any, res, next));
router.delete('/:id', (req, res, next) => conversationController.deleteConversation(req as any, res, next));

export default router;
