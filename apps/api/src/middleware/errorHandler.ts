import { ZodError } from 'zod';
import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  console.error(err);

  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation error',
      errors: err.errors.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
    return;
  }

  const status = typeof err.status === 'number' ? err.status : 500;
  const message = err.message ?? 'Internal server error';

  res.status(status).json({ message });
};

export default errorHandler;
