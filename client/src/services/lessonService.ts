import type { ApiResponse } from "../types/auth.types";
import type { Lesson, LessonSummary, Progress } from "../types/learning.types";
import { api } from "./api";

export async function fetchLessons(): Promise<LessonSummary[]> {
  const res = await api.get<ApiResponse<LessonSummary[]>>("/lessons");
  return res.data.data;
}

export async function fetchLesson(id: string): Promise<Lesson> {
  const res = await api.get<ApiResponse<Lesson>>(`/lessons/${encodeURIComponent(id)}`);
  return res.data.data;
}

export async function fetchProgress(): Promise<Progress> {
  const res = await api.get<ApiResponse<Progress>>("/progress");
  return res.data.data;
}

export async function setLessonCompleted(id: string, completed: boolean): Promise<void> {
  const url = `/progress/lessons/${encodeURIComponent(id)}`;
  if (completed) await api.post(url);
  else await api.delete(url);
}
