export interface Diagnostic {
  phase: string;
  severity: "error" | "warning";
  message: string;
  line: number;
  column: number;
}

export interface PhaseReport {
  phase: string;
  label: string;
  status: "success" | "failed" | "skipped";
  errors: number;
  warnings: number;
}

export interface Paged<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface RunSummary {
  id: string;
  programId: string | null;
  status: "SUCCESS" | "FAILED";
  sourceCode: string;
  createdAt: string;
}

// A saved run as returned by GET /compiler/history/:id
export interface StoredRun {
  id: string;
  programId: string | null;
  status: "SUCCESS" | "FAILED";
  sourceCode: string;
  createdAt: string;
  tokens: unknown[] | null;
  intermediateCode: { text: string } | null;
  optimizedCode: { text: string; steps?: unknown[] } | null;
  targetCode: { text: string; note?: string } | null;
  errors: {
    failedPhase: string | null;
    phases: PhaseReport[];
    errors: Diagnostic[];
    warnings: Diagnostic[];
  } | null;
}
