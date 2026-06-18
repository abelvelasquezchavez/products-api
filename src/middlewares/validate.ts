import { NextFunction, Request, Response, RequestHandler } from 'express';
import { ZodTypeAny } from 'zod';

/**
 * Builds a middleware that validates `body`, `params` and `query` against the
 * given Zod schema. Parsed (and coerced) values are written back onto the
 * request so downstream handlers work with clean, typed data. Validation
 * errors are forwarded to the centralized error handler.
 */
export function validate(schema: ZodTypeAny): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      next(result.error);
      return;
    }

    const parsed = result.data as {
      body?: unknown;
      params?: Record<string, unknown>;
      query?: Record<string, unknown>;
    };

    if (parsed.body !== undefined) {
      req.body = parsed.body;
    }
    // `req.params` and `req.query` are getter-backed; mutate in place instead
    // of reassigning so coerced values are preserved across Express versions.
    if (parsed.params) {
      Object.assign(req.params, parsed.params);
    }
    if (parsed.query) {
      Object.assign(req.query, parsed.query);
    }

    next();
  };
}
