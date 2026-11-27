import { completeLesson, getProgress, uncompleteLesson } from "../services/progress.service";
import { asyncHandler } from "../utils/asyncHandler";
import { currentUser } from "../utils/currentUser";

export const getProgressHandler = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getProgress(currentUser(req).id) });
});

export const completeLessonHandler = asyncHandler(async (req, res) => {
  const data = await completeLesson(currentUser(req).id, String(req.params.id));
  res.json({ success: true, data });
});

export const uncompleteLessonHandler = asyncHandler(async (req, res) => {
  const data = await uncompleteLesson(currentUser(req).id, String(req.params.id));
  res.json({ success: true, data });
});
