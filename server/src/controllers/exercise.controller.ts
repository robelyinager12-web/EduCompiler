import {
  adminCreateExercise,
  adminDeleteExercise,
  adminGetExercise,
  adminListExercises,
  adminUpdateExercise,
  getExercise,
  listExercises,
  submitExercise,
} from "../services/exercise.service";
import { asyncHandler } from "../utils/asyncHandler";
import { currentUser } from "../utils/currentUser";
import type { ExerciseInput } from "../validators/exercise.validator";

export const getExercises = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await listExercises() });
});

export const getExerciseById = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getExercise(String(req.params.id)) });
});

export const submitExerciseHandler = asyncHandler(async (req, res) => {
  const { sourceCode } = req.body as { sourceCode: string };
  const submission = await submitExercise(currentUser(req).id, String(req.params.id), sourceCode);
  res.status(201).json({ success: true, data: submission });
});

// ---------- Admin ----------

export const adminGetExercises = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await adminListExercises() });
});

export const adminGetExerciseById = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await adminGetExercise(String(req.params.id)) });
});

export const adminCreateExerciseHandler = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await adminCreateExercise(req.body as ExerciseInput) });
});

export const adminUpdateExerciseHandler = asyncHandler(async (req, res) => {
  const exercise = await adminUpdateExercise(String(req.params.id), req.body as ExerciseInput);
  res.json({ success: true, data: exercise });
});

export const adminDeleteExerciseHandler = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await adminDeleteExercise(String(req.params.id)) });
});
