import type { ApiResponse } from "../types/auth.types";
import type { Exercise, ExerciseSummary, Submission } from "../types/learning.types";
import { api } from "./api";

export async function fetchExercises(): Promise<ExerciseSummary[]> {
  const res = await api.get<ApiResponse<ExerciseSummary[]>>("/exercises");
  return res.data.data;
}

export async function fetchExercise(id: string): Promise<Exercise> {
  const res = await api.get<ApiResponse<Exercise>>(`/exercises/${encodeURIComponent(id)}`);
  return res.data.data;
}

export async function submitExercise(id: string, sourceCode: string): Promise<Submission> {
  const res = await api.post<ApiResponse<Submission>>(
    `/exercises/${encodeURIComponent(id)}/submit`,
    { sourceCode },
  );
  return res.data.data;
}
