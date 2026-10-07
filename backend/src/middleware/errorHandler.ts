import { Request, Response, NextFunction } from 'express';
import { AppError, sendError } from '../utils/response';
import { ZodError } from 'zod';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.code, err.details);
    return;
  }

  if (err instanceof ZodError) {
    const details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    sendError(res, 'Validation error', 422, 'VALIDATION_ERROR', details);
    return;
  }

  console.error('[Unhandled Error]', err);
  sendError(res, 'Internal server error', 500, 'INTERNAL_SERVER_ERROR');
}
