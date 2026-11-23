import { Router } from "express";
import { prisma } from "../config/prisma";

const healthRouter = Router();

// Render uses this endpoint to check that the service is alive.
healthRouter.get("/", async (_req, res) => {
  let database: "connected" | "unavailable" = "connected";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "unavailable";
  }

  res.json({
    status: "ok",
    service: "EduCompiler API",
    database,
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;