import type { ApiResponse } from "../types/auth.types";
import type { Paged, RunSummary, StoredRun } from "../types/compiler.types";
import { api } from "./api";

export async function fetchHistory(page = 1, limit = 20): Promise<Paged<RunSummary>> {
  const res = await api.get<ApiResponse<Paged<RunSummary>>>("/compiler/history", {
    params: { page, limit },
  });
  return res.data.data;
}

export async function fetchRun(id: string): Promise<StoredRun> {
  const res = await api.get<ApiResponse<StoredRun>>(`/compiler/history/${encodeURIComponent(id)}`);
  return res.data.data;
}
