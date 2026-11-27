import { Router } from "express";
import { compileHandler } from "../controllers/compiler.controller";
import { compilerLimiter } from "../middleware/rateLimit.middleware";
import { validate } from "../middleware/validate.middleware";
import { compileBodySchema } from "../validators/compiler.validator";

const compilerRouter = Router();

compilerRouter.use(compilerLimiter);
compilerRouter.post("/lexical", validate(compileBodySchema), compileHandler("lexical"));
compilerRouter.post("/syntax", validate(compileBodySchema), compileHandler("syntax"));
compilerRouter.post("/semantic", validate(compileBodySchema), compileHandler("semantic"));
compilerRouter.post("/compile", validate(compileBodySchema), compileHandler("full"));
// Phase 13 adds: GET /history and GET /history/:id (they need the logged-in user)

export default compilerRouter;
