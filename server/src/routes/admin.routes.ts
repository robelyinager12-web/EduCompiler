import { Router } from "express";
import {
  adminCreateExerciseHandler,
  adminDeleteExerciseHandler,
  adminGetExerciseById,
  adminGetExercises,
  adminUpdateExerciseHandler,
} from "../controllers/exercise.controller";
import { getConceptsHandler } from "../controllers/concept.controller";
import { getStatsHandler } from "../controllers/stats.controller";
import { deleteStudentHandler, getStudents } from "../controllers/user.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import { exerciseBodySchema } from "../validators/exercise.validator";

const adminRouter = Router();

// Everything below needs a logged-in ADMIN.
adminRouter.use(requireAuth, requireRole("ADMIN"));

adminRouter.get("/stats", getStatsHandler);
adminRouter.get("/concepts", getConceptsHandler);

adminRouter.get("/students", getStudents);
adminRouter.delete("/students/:id", validate(idParamSchema, "params"), deleteStudentHandler);

adminRouter.get("/exercises", adminGetExercises);
adminRouter.get("/exercises/:id", validate(idParamSchema, "params"), adminGetExerciseById);
adminRouter.post("/exercises", validate(exerciseBodySchema), adminCreateExerciseHandler);
adminRouter.put(
  "/exercises/:id",
  validate(idParamSchema, "params"),
  validate(exerciseBodySchema),
  adminUpdateExerciseHandler,
);
adminRouter.delete("/exercises/:id", validate(idParamSchema, "params"), adminDeleteExerciseHandler);

export default adminRouter;
