import { userRepository } from '../repositories/userRepository';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { signToken } from '../utils/jwt';
import { ConflictError, UnauthorizedError } from '../utils/AppError';
import { LoginInput, RegisterInput } from '../schemas/authSchema';

export interface AuthResult {
  token: string;
  user: { id: number; email: string };
}

export const authService = {
  async register({ email, password }: RegisterInput): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email is already registered');
    }

    const hashed = await hashPassword(password);
    const user = await userRepository.create({ email, password: hashed });

    return {
      token: signToken({ sub: user.id, email: user.email }),
      user: { id: user.id, email: user.email },
    };
  },

  async login({ email, password }: LoginInput): Promise<AuthResult> {
    const user = await userRepository.findByEmail(email);
    // Verify the password even when the user is missing is unnecessary here;
    // we return the same generic message in both cases to avoid leaking which
    // emails exist.
    if (!user || !(await comparePassword(password, user.password))) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return {
      token: signToken({ sub: user.id, email: user.email }),
      user: { id: user.id, email: user.email },
    };
  },
};
