import type { Request } from "express";

export interface Paging {
  page: number;
  limit: number;
  skip: number;
}

// ?page=2&limit=20. Bad or huge values are corrected, never rejected.
export function parsePaging(query: Request["query"], defaultLimit = 20): Paging {
  const page = Math.min(100000, Math.max(1, Math.floor(Number(query.page)) || 1));
  const limit = Math.min(50, Math.max(1, Math.floor(Number(query.limit)) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}
