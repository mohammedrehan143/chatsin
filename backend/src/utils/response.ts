import { Response } from 'express';
import { ApiResponse } from '../types';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST', details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): Response {
  const response: ApiResponse<T> = {
    success: true,
    data
  };
  return res.status(statusCode).json(response);
}

export function sendError(res: Response, message: string, statusCode = 400, code = 'ERROR', details?: any): Response {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  };
  return res.status(statusCode).json(response);
}
