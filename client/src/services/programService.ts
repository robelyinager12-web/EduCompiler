import type { ApiResponse } from "../types/auth.types";
import type { ProgramSummary } from "../types/program.types";
import { api } from "./api";

export async function fetchPrograms(): Promise<ProgramSummary[]> {
  const res = await api.get<ApiResponse<ProgramSummary[]>>("/programs");
  return res.data.data;
}

export async function deleteProgram(id: string): Promise<void> {
  await api.delete(`/programs/${encodeURIComponent(id)}`);
}
