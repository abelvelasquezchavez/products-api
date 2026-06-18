import express, { Application, NextFunction, Request, Response } from 'express';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { NotFoundError } from './utils/AppError';

/**
 * Builds and configures the Express application. Kept separate from the server
 * bootstrap (`index.ts`) so tests can import the app without opening a port.
 */
export function createApp(): Application {
  const app = express();

  app.use(express.json());

  app.use('/api', routes);

  // Unmatched routes -> 404 forwarded to the centralized error handler.
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
  });

  app.use(errorHandler);

  return app;
}

export const app = createApp();
