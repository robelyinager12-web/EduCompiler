import { Router } from "express";

const healthRouter = Router();

// Render uses this endpoint to check that the service is alive.
healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "EduCompiler API",
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;
