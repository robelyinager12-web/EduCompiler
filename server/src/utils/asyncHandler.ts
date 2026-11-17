import type { NextFunction, Request, RequestHandler, Response } from "express";

// Wraps an async controller so any thrown error reaches the error middleware.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    void fn(req, res, next).catch(next);
  };
}
