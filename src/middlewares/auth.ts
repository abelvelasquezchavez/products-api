import { NextFunction, Request, Response, RequestHandler } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/AppError';

/**
 * Requires a valid `Authorization: Bearer <token>` header. On success the
 * decoded payload is attached to `req.user`; otherwise an `UnauthorizedError`
 * is forwarded to the error handler.
 */
export const requireAuth: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication token is missing');
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    throw new UnauthorizedError('Authentication token is missing');
  }

  req.user = verifyToken(token);
  next();
};
