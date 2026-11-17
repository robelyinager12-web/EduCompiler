import cors from "cors";
import express from "express";
import helmet from "helmet";
import { corsOptions } from "./config/cors";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";
import { notFound } from "./middleware/notFound.middleware";
import { apiLimiter } from "./middleware/rateLimit.middleware";
import apiRouter from "./routes";

const app = express();

// Render runs behind a proxy; this lets rate limiting see the real client IP.
if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "100kb" }));
app.use("/api", apiLimiter, apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
