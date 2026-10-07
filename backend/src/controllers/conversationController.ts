import { Response, NextFunction } from 'express';
import { chatService } from '../services/chat/chatService';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';

const createConversationSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required')
});

const sendMessageSchema = z.object({
  content: z.string().min(1, 'Content is required').max(4000)
});

export class ConversationController {
  async getMyConversations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const conversations = await chatService.getUserConversations(userId);
      sendSuccess(res, conversations, 200);
    } catch (error) {
      next(error);
    }
  }

  async createDirectConversation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { recipientId } = createConversationSchema.parse(req.body);
      const conversation = await chatService.getOrCreateDirectConversation(userId, recipientId);
      sendSuccess(res, conversation, 201);
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id: conversationId } = req.params;
      const limit = parseInt((req.query.limit as string) || '50', 10);
      const before = req.query.before as string | undefined;

      const messages = await chatService.getConversationMessages(conversationId, userId, limit, before);
      sendSuccess(res, messages, 200);
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id: conversationId } = req.params;
      const { content } = sendMessageSchema.parse(req.body);

      const message = await chatService.sendMessage(userId, conversationId, content);
      sendSuccess(res, message, 201);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id: conversationId } = req.params;

      const updatedIds = await chatService.markConversationRead(conversationId, userId);
      sendSuccess(res, { readMessageIds: updatedIds }, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const conversationController = new ConversationController();
