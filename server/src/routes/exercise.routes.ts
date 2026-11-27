import { Router } from "express";
import {
  getExerciseById,
  getExercises,
  submitExerciseHandler,
} from "../controllers/exercise.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { compilerLimiter } from "../middleware/rateLimit.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import { submitBodySchema } from "../validators/exercise.validator";

const exerciseRouter = Router();

exerciseRouter.get("/", getExercises);
exerciseRouter.get("/:id", validate(idParamSchema, "params"), getExerciseById);
exerciseRouter.post(
  "/:id/submit",
  requireAuth,
  compilerLimiter,
  validate(idParamSchema, "params"),
  validate(submitBodySchema),
  submitExerciseHandler,
);

export default exerciseRouter;
