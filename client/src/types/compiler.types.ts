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

// ---------- Full compile result (POST /compiler/compile) ----------

export type DataType = "int" | "float" | "string" | "bool";

export interface Token {
  type: string;
  lexeme: string;
  value?: number | string | boolean;
  line: number;
  column: number;
}

interface Pos {
  line: number;
  column: number;
}

export type Expr =
  | (Pos & { kind: "Literal"; valueType: DataType; value: number | string | boolean })
  | (Pos & { kind: "Identifier"; name: string })
  | (Pos & { kind: "Unary"; operator: string; operand: Expr })
  | (Pos & { kind: "Binary"; operator: string; left: Expr; right: Expr })
  | (Pos & { kind: "Grouping"; expression: Expr });

export type Stmt =
  | (Pos & { kind: "VariableDeclaration"; varType: DataType; name: string; initializer: Expr | null })
  | (Pos & { kind: "Assignment"; name: string; value: Expr })
  | (Pos & { kind: "PrintStatement"; expression: Expr });

export interface ProgramNode extends Pos {
  kind: "Program";
  body: Stmt[];
}

export interface SymbolEntry {
  name: string;
  type: DataType;
  value: number | string | boolean | null;
  scope: string;
  line: number;
  initialized: boolean;
}

export interface OptimizationStep {
  kind: "constant-propagation" | "constant-folding" | "dead-code-elimination";
  stmt: number;
  line: number;
  before: string;
  after: string | null;
  explanation: string;
}

export interface OptimizationStats {
  instructionsBefore: number;
  instructionsAfter: number;
  propagations: number;
  foldings: number;
  eliminations: number;
}

export interface TargetMapping {
  tacIndex: number;
  line: number;
  tac: string;
  target: string[];
}

export interface CompileResult {
  status: "SUCCESS" | "FAILED";
  failedPhase: string | null;
  phases: PhaseReport[];
  tokens: Token[] | null;
  ast: ProgramNode | null;
  symbolTable: SymbolEntry[] | null;
  intermediateCode: { text: string } | null;
  optimization: { text: string; steps: OptimizationStep[]; stats: OptimizationStats } | null;
  target: { text: string; note: string; mapping: TargetMapping[]; registersUsed: number } | null;
  errors: Diagnostic[];
  warnings: Diagnostic[];
  runId?: string | null;
}
