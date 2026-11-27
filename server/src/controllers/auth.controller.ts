import { login, register } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { currentUser } from "../utils/currentUser";
import type { LoginInput, RegisterInput } from "../validators/auth.validator";

export const registerHandler = asyncHandler(async (req, res) => {
  const data = await register(req.body as RegisterInput);
  res.status(201).json({ success: true, data });
});

export const loginHandler = asyncHandler(async (req, res) => {
  const data = await login(req.body as LoginInput);
  res.json({ success: true, data });
});

export const meHandler = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: currentUser(req) } });
});
