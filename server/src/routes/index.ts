import { Router } from "express";
import healthRouter from "./health.routes";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
// Later phases mount: /auth, /programs, /compiler, /lessons, /exercises, /admin

export default apiRouter;
