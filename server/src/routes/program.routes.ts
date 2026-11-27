import { Router } from "express";
import {
  createProgramHandler,
  deleteProgramHandler,
  getProgramById,
  getPrograms,
  updateProgramHandler,
} from "../controllers/program.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import { programBodySchema } from "../validators/program.validator";

const programRouter = Router();

// Every program route needs a logged-in user, and only touches that user's programs.
programRouter.use(requireAuth);
programRouter.get("/", getPrograms);
programRouter.post("/", validate(programBodySchema), createProgramHandler);
programRouter.get("/:id", validate(idParamSchema, "params"), getProgramById);
programRouter.put(
  "/:id",
  validate(idParamSchema, "params"),
  validate(programBodySchema),
  updateProgramHandler,
);
programRouter.delete("/:id", validate(idParamSchema, "params"), deleteProgramHandler);

export default programRouter;
