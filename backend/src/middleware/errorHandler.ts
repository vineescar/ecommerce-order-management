import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Handle known API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Handle PostgreSQL errors
  if ('code' in err) {
    const pgError = err as Error & { code: string };

    switch (pgError.code) {
      case '23505': // Unique violation
        res.status(409).json({
          success: false,
          message: 'Resource already exists',
        });
        return;

      case '23503': // Foreign key violation
        res.status(400).json({
          success: false,
          message: 'Referenced resource does not exist',
        });
        return;

      case '22P02': // Invalid text representation
        res.status(400).json({
          success: false,
          message: 'Invalid input format',
        });
        return;
    }
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  });
};

// 404 handler for undefined routes
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};
