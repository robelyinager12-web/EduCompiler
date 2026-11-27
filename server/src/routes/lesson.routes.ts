import { Router } from "express";
import { getLessonById, getLessons } from "../controllers/lesson.controller";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validator";

const lessonRouter = Router();

lessonRouter.get("/", getLessons);
lessonRouter.get("/:id", validate(idParamSchema, "params"), getLessonById);
// Phase 13 adds admin-only POST, PUT and DELETE

export default lessonRouter;
