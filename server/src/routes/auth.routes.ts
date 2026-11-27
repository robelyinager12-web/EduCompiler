import { Router } from "express";
import { loginHandler, meHandler, registerHandler } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rateLimit.middleware";
import { validate } from "../middleware/validate.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validator";

const authRouter = Router();

authRouter.post("/register", authLimiter, validate(registerSchema), registerHandler);
authRouter.post("/login", authLimiter, validate(loginSchema), loginHandler);
authRouter.get("/me", requireAuth, meHandler);

export default authRouter;
