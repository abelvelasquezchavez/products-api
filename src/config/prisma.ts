import { PrismaClient } from '@prisma/client';
import { env } from './env';

/**
 * Single shared PrismaClient instance.
 *
 * In development, module reloads (e.g. ts-node-dev) can create multiple
 * clients and exhaust the database connection pool, so we cache the instance
 * on `globalThis`.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
