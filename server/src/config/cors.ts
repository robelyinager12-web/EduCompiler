import type { CorsOptions } from "cors";
import { env } from "./env";

const allowedOrigins = env.CLIENT_URL.split(",").map((url) => url.trim());

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Requests without an Origin header (Postman, curl, health checks) are allowed
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
};
