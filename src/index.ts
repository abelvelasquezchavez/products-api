import { Server } from 'http';
import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const server: Server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

/**
 * Graceful shutdown: stop accepting new connections, then disconnect Prisma
 * before exiting. A timeout guards against connections that never drain.
 */
async function shutdown(signal: string): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received, shutting down gracefully...`);

  const forceExit = setTimeout(() => {
    // eslint-disable-next-line no-console
    console.error('Could not close connections in time, forcing exit');
    process.exit(1);
  }, 10_000);

  server.close(async () => {
    try {
      await prisma.$disconnect();
      clearTimeout(forceExit);
      // eslint-disable-next-line no-console
      console.log('Closed remaining connections, bye 👋');
      process.exit(0);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error during shutdown', error);
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
