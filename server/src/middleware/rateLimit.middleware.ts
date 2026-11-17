import rateLimit from "express-rate-limit";

const message = { success: false, message: "Too many requests, please try again later." };

// General limit for the whole API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});

// Stricter limit for login and register (used in Phase 13)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});
