import {
  createLesson,
  deleteLesson,
  getLesson,
  listLessons,
  updateLesson,
} from "../services/lesson.service";
import { asyncHandler } from "../utils/asyncHandler";
import type { LessonInput } from "../validators/lesson.validator";

export const getLessons = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await listLessons() });
});

export const getLessonById = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getLesson(String(req.params.id)) });
});

export const createLessonHandler = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await createLesson(req.body as LessonInput) });
});

export const updateLessonHandler = asyncHandler(async (req, res) => {
  const lesson = await updateLesson(String(req.params.id), req.body as LessonInput);
  res.json({ success: true, data: lesson });
});

export const deleteLessonHandler = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await deleteLesson(String(req.params.id)) });
});
