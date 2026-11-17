import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/ApiError";

type Source = "body" | "query" | "params";

// Usage later: router.post("/register", validate(registerSchema), controller)
export function validate(schema: ZodType, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".") || source}: ${issue.message}`)
        .join("; ");
      next(new ApiError(400, message));
      return;
    }

    // Replace the body with the cleaned, typed data
    if (source === "body") {
      req.body = result.data;
    }
    next();
  };
}
