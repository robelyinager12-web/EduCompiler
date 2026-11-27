import { Router } from "express";
import {
  completeLessonHandler,
  getProgressHandler,
  uncompleteLessonHandler,
} from "../controllers/progress.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validator";

const progressRouter = Router();

progressRouter.use(requireAuth);
progressRouter.get("/", getProgressHandler);
progressRouter.post("/lessons/:id", validate(idParamSchema, "params"), completeLessonHandler);
progressRouter.delete("/lessons/:id", validate(idParamSchema, "params"), uncompleteLessonHandler);

export default progressRouter;
