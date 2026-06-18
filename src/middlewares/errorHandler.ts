import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

interface ErrorResponseBody {
  status: 'error';
  message: string;
  errors?: { path: string; message: string }[];
  stack?: string;
}

/**
 * Centralized error-handling middleware. Every error forwarded via `next(err)`
 * ends up here and is translated into a consistent JSON response. It knows how
 * to handle our own `AppError`, Zod validation errors and a couple of common
 * Prisma errors; anything else is treated as an unexpected 500.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // `next` is required for Express to recognise this as an error handler.
  _next: NextFunction,
): void {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: { path: string; message: string }[] | undefined;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'A record with the provided value already exists';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Resource not found';
    } else {
      statusCode = 400;
      message = 'Database request error';
    }
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Log unexpected (non-operational) errors for observability.
  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  const body: ErrorResponseBody = { status: 'error', message };
  if (errors) {
    body.errors = errors;
  }
  if (env.NODE_ENV === 'development' && err instanceof Error) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}
