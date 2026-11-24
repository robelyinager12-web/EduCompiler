export type CompilerPhase =
  | "lexical"
  | "syntax"
  | "semantic"
  | "intermediate"
  | "optimization"
  | "codegen";

export type Severity = "error" | "warning";

export interface Diagnostic {
  phase: CompilerPhase;
  severity: Severity;
  message: string;
  line: number;
  column: number;
}

export function createDiagnostic(
  phase: CompilerPhase,
  message: string,
  line: number,
  column: number,
  severity: Severity = "error",
): Diagnostic {
  return { phase, severity, message, line, column };
}
