import { Router } from "express";
import { getExerciseById, getExercises } from "../controllers/exercise.controller";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validator";

const exerciseRouter = Router();

exerciseRouter.get("/", getExercises);
exerciseRouter.get("/:id", validate(idParamSchema, "params"), getExerciseById);
// Phase 13 adds POST /:id/submit (needs the logged-in user)

export default exerciseRouter;
