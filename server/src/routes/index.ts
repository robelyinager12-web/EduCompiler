import { Router } from "express";
import adminRouter from "./admin.routes";
import authRouter from "./auth.routes";
import compilerRouter from "./compiler.routes";
import exerciseRouter from "./exercise.routes";
import healthRouter from "./health.routes";
import lessonRouter from "./lesson.routes";
import programRouter from "./program.routes";
import progressRouter from "./progress.routes";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/programs", programRouter);
apiRouter.use("/progress", progressRouter);
apiRouter.use("/compiler", compilerRouter);
apiRouter.use("/lessons", lessonRouter);
apiRouter.use("/exercises", exerciseRouter);
apiRouter.use("/admin", adminRouter);

export default apiRouter;
