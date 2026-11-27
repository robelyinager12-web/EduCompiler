import { getExercise, listExercises } from "../services/exercise.service";
import { asyncHandler } from "../utils/asyncHandler";

export const getExercises = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await listExercises() });
});

export const getExerciseById = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getExercise(String(req.params.id)) });
});
