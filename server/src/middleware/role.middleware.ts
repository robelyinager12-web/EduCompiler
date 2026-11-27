import type { NextFunction, Request, Response } from "express";
import type { AuthUser } from "../types/api.types";
import { ApiError } from "../utils/ApiError";

// Use after requireAuth: router.use(requireAuth, requireRole("ADMIN"))
export function requireRole(...roles: AuthUser["role"][]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, "Authentication required."));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ApiError(403, "You do not have permission to do this."));
      return;
    }
    next();
  };
}
