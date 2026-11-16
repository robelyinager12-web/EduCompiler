import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

// Express recognises an error handler by its four parameters.
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    // Hide internal details of unexpected errors in production
    message:
      statusCode === 500 && env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
}
