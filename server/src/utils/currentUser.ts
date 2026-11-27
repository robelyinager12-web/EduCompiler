import type { Request } from "express";
import type { AuthUser } from "../types/api.types";
import { ApiError } from "./ApiError";

export function currentUser(req: Request): AuthUser {
  if (!req.user) throw new ApiError(401, "Authentication required.");
  return req.user;
}
