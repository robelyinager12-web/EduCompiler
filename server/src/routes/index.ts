import { Router } from "express";
import compilerRouter from "./compiler.routes";
import exerciseRouter from "./exercise.routes";
import healthRouter from "./health.routes";
import lessonRouter from "./lesson.routes";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/compiler", compilerRouter);
apiRouter.use("/lessons", lessonRouter);
apiRouter.use("/exercises", exerciseRouter);
// Later phases mount: /auth, /programs, /admin

export default apiRouter;
