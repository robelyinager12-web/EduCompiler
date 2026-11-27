import { Router } from "express";
import {
  compileFull,
  compileHandler,
  getHistory,
  getHistoryItem,
} from "../controllers/compiler.controller";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware";
import { compilerLimiter } from "../middleware/rateLimit.middleware";
import { validate } from "../middleware/validate.middleware";
import { compileBodySchema } from "../validators/compiler.validator";
import { idParamSchema } from "../validators/common.validator";

const compilerRouter = Router();

compilerRouter.use(compilerLimiter);
compilerRouter.post("/lexical", validate(compileBodySchema), compileHandler("lexical"));
compilerRouter.post("/syntax", validate(compileBodySchema), compileHandler("syntax"));
compilerRouter.post("/semantic", validate(compileBodySchema), compileHandler("semantic"));
// Anyone can compile. A logged-in student also gets the run saved to their history.
compilerRouter.post("/compile", optionalAuth, validate(compileBodySchema), compileFull);

compilerRouter.get("/history", requireAuth, getHistory);
compilerRouter.get("/history/:id", requireAuth, validate(idParamSchema, "params"), getHistoryItem);

export default compilerRouter;
