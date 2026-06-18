import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from './AppError';

/** Data we embed in (and read back from) the JWT. */
export interface TokenPayload {
  sub: number;
  email: string;
}

/** Signs a JWT for the given user payload. */
export function signToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

/**
 * Verifies a JWT and returns its typed payload. Throws `UnauthorizedError`
 * when the token is missing required claims, expired or otherwise invalid.
 */
export function verifyToken(token: string): TokenPayload {
  let decoded: string | JwtPayload;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }

  if (
    typeof decoded === 'string' ||
    typeof decoded.sub !== 'number' ||
    typeof decoded.email !== 'string'
  ) {
    throw new UnauthorizedError('Invalid token payload');
  }

  return { sub: decoded.sub, email: decoded.email };
}
