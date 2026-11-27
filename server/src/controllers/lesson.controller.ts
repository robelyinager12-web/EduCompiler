import { getLesson, listLessons } from "../services/lesson.service";
import { asyncHandler } from "../utils/asyncHandler";

export const getLessons = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await listLessons() });
});

export const getLessonById = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getLesson(String(req.params.id)) });
});
