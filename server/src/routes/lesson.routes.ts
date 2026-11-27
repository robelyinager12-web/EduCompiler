import { Router } from "express";
import {
  createLessonHandler,
  deleteLessonHandler,
  getLessonById,
  getLessons,
  updateLessonHandler,
} from "../controllers/lesson.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import { lessonBodySchema } from "../validators/lesson.validator";

const lessonRouter = Router();

lessonRouter.get("/", getLessons);
lessonRouter.get("/:id", validate(idParamSchema, "params"), getLessonById);

// Admin only
lessonRouter.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  validate(lessonBodySchema),
  createLessonHandler,
);
lessonRouter.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(lessonBodySchema),
  updateLessonHandler,
);
lessonRouter.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  deleteLessonHandler,
);

export default lessonRouter;
