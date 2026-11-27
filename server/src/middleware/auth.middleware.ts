import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/jwt";

function bearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token ? token : null;
}

// Requires a valid token and loads the CURRENT user from the database.
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = bearerToken(req);
    if (!token) throw new ApiError(401, "Authentication required.");

    const payload = verifyToken(token);
    if (!payload) throw new ApiError(401, "Invalid or expired token.");

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) throw new ApiError(401, "This account no longer exists.");

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

// No Authorization header: continue anonymously. A header that is present must be valid.
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.headers.authorization) {
    next();
    return;
  }
  await requireAuth(req, res, next);
}
