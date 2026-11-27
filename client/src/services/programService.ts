import type { ApiResponse } from "../types/auth.types";
import type { Program, ProgramSummary } from "../types/program.types";
import { api } from "./api";

export async function fetchPrograms(): Promise<ProgramSummary[]> {
  const res = await api.get<ApiResponse<ProgramSummary[]>>("/programs");
  return res.data.data;
}

export async function fetchProgram(id: string): Promise<Program> {
  const res = await api.get<ApiResponse<Program>>(`/programs/${encodeURIComponent(id)}`);
  return res.data.data;
}

export async function createProgram(title: string, sourceCode: string): Promise<Program> {
  const res = await api.post<ApiResponse<Program>>("/programs", { title, sourceCode });
  return res.data.data;
}

export async function updateProgram(id: string, title: string, sourceCode: string): Promise<Program> {
  const res = await api.put<ApiResponse<Program>>(`/programs/${encodeURIComponent(id)}`, {
    title,
    sourceCode,
  });
  return res.data.data;
}

export async function deleteProgram(id: string): Promise<void> {
  await api.delete(`/programs/${encodeURIComponent(id)}`);
}
