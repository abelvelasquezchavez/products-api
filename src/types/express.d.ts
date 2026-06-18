import { TokenPayload } from '../utils/jwt';

/**
 * Augments Express's `Request` so authenticated handlers can read the
 * decoded JWT payload from `req.user` in a type-safe way.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export {};
