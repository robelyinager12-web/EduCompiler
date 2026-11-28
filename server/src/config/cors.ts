import type { CorsOptions } from "cors";
import { env } from "./env";

// Browser origins never end with a slash, so "https://app.vercel.app/" is normalised.
const allowedOrigins = env.CLIENT_URL.split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // No Origin header (Postman, curl, health checks): allowed.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    // Not allowed: send no CORS headers, so the browser blocks the call.
    // This is not a server error, so it must not become a 500.
    callback(null, false);
  },
  credentials: true,
};
