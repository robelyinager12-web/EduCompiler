import type {
  AdminExercise,
  AdminStats,
  ConceptInfo,
  ExerciseInput,
  LessonInput,
  StudentRow,
} from "../types/admin.types";
import type { ApiResponse } from "../types/auth.types";
import type { Paged } from "../types/compiler.types";
import { api } from "./api";

const enc = encodeURIComponent;

export async function fetchStats(): Promise<AdminStats> {
  const res = await api.get<ApiResponse<AdminStats>>("/admin/stats");
  return res.data.data;
}

export async function fetchStudents(page = 1, limit = 10): Promise<Paged<StudentRow>> {
  const res = await api.get<ApiResponse<Paged<StudentRow>>>("/admin/students", {
    params: { page, limit },
  });
  return res.data.data;
}

export async function deleteStudent(id: string): Promise<void> {
  await api.delete(`/admin/students/${enc(id)}`);
}

export async function createLesson(input: LessonInput): Promise<void> {
  await api.post("/lessons", input);
}

export async function updateLesson(id: string, input: LessonInput): Promise<void> {
  await api.put(`/lessons/${enc(id)}`, input);
}

export async function deleteLesson(id: string): Promise<void> {
  await api.delete(`/lessons/${enc(id)}`);
}

export async function fetchAdminExercises(): Promise<AdminExercise[]> {
  const res = await api.get<ApiResponse<AdminExercise[]>>("/admin/exercises");
  return res.data.data;
}

export async function createExercise(input: ExerciseInput): Promise<void> {
  await api.post("/admin/exercises", input);
}

export async function updateExercise(id: string, input: ExerciseInput): Promise<void> {
  await api.put(`/admin/exercises/${enc(id)}`, input);
}

export async function deleteExercise(id: string): Promise<void> {
  await api.delete(`/admin/exercises/${enc(id)}`);
}

export async function fetchConcepts(): Promise<ConceptInfo[]> {
  const res = await api.get<ApiResponse<ConceptInfo[]>>("/admin/concepts");
  return res.data.data;
}
