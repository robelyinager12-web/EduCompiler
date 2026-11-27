import type { Program } from "../ast/nodes";
import type { TargetResult } from "../code-generator/target.types";
import type { CompilerPhase, Diagnostic } from "../errors/CompilerError";
import type { TacInstruction } from "../intermediate/tac.types";
import type { Token } from "../lexer/token.types";
import type { OptimizationResult } from "../optimizer/optimizer";
import type { SymbolEntry } from "../symbol-table/symbolTable";

export type PhaseStatus = "success" | "failed" | "skipped";

export interface PhaseReport {
  phase: CompilerPhase;
  label: string;
  status: PhaseStatus;
  errors: number;
  warnings: number;
}

export interface IntermediateOutput {
  instructions: TacInstruction[];
  text: string;
}

export interface OptimizationOutput extends OptimizationResult {
  text: string;
}

export interface TargetOutput extends TargetResult {
  text: string;
}

export interface CompileResult {
  status: "SUCCESS" | "FAILED";
  failedPhase: CompilerPhase | null;
  phases: PhaseReport[];
  tokens: Token[] | null;
  ast: Program | null;
  symbolTable: SymbolEntry[] | null;
  intermediateCode: IntermediateOutput | null;
  optimization: OptimizationOutput | null;
  target: TargetOutput | null;
  errors: Diagnostic[];
  warnings: Diagnostic[];
}

export interface CompileOptions {
  stopAfter?: CompilerPhase;
}
