import { NextFunction, Request, Response, RequestHandler } from 'express';

/**
 * Wraps an async route handler so that any rejected promise is forwarded to
 * Express's error-handling middleware via `next`. This removes the need for a
 * try/catch block in every controller.
 */
export const asyncHandler =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next): void => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
