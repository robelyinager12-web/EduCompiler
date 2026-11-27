import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

// ApiError carries its own status. body-parser errors (bad JSON, body too large)
// carry a 4xx status too. Everything else is an unexpected 500.
function statusOf(err: Error): number {
  if (err instanceof ApiError) return err.statusCode;
  const status = (err as { status?: unknown }).status;
  if (typeof status === "number" && status >= 400 && status < 500) return status;
  return 500;
}

function messageOf(err: Error, statusCode: number): string {
  const type = (err as { type?: unknown }).type;
  if (type === "entity.parse.failed") return "Request body is not valid JSON.";
  if (type === "entity.too.large") return "Request body is too large.";
  // Hide internal details of unexpected errors in production
  if (statusCode === 500 && env.NODE_ENV === "production") return "Internal server error";
  return err.message;
}

// Express recognises an error handler by its four parameters.
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = statusOf(err);

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: messageOf(err, statusCode),
  });
}
