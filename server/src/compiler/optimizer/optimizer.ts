import type { TacInstruction } from "../intermediate/tac.types";
import { formatInstruction } from "../intermediate/tacFormatter";
import type { SymbolEntry } from "../symbol-table/symbolTable";
import { fold } from "./constantFolding";
import { propagate, recordResult, type KnownConstants } from "./constantPropagation";
import { eliminateDeadCode } from "./deadCodeElimination";

export type OptimizationKind =
  | "constant-propagation"
  | "constant-folding"
  | "dead-code-elimination";

export interface OptimizationStep {
  kind: OptimizationKind;
  stmt: number;
  line: number;
  before: string;
  after: string | null; // null when the instruction was removed
  explanation: string;
}

export interface OptimizationStats {
  instructionsBefore: number;
  instructionsAfter: number;
  propagations: number;
  foldings: number;
  eliminations: number;
}

export interface OptimizationResult {
  instructions: TacInstruction[];
  steps: OptimizationStep[];
  stats: OptimizationStats;
}

export function optimize(
  instructions: TacInstruction[],
  symbolTable: SymbolEntry[],
): OptimizationResult {
  const steps: OptimizationStep[] = [];
  const known: KnownConstants = new Map();
  const forward: TacInstruction[] = [];

  // Pass 1 (forward): propagate known constants, then fold.
  for (const original of instructions) {
    const { instruction: propagated, replaced } = propagate(original, known);
    if (replaced.length > 0) {
      steps.push({
        kind: "constant-propagation",
        stmt: original.stmt,
        line: original.line,
        before: formatInstruction(original),
        after: formatInstruction(propagated),
        explanation: `Known constant values were substituted (${replaced.join(", ")}).`,
      });
    }

    const { instruction: folded, changed } = fold(propagated);
    if (changed) {
      steps.push({
        kind: "constant-folding",
        stmt: propagated.stmt,
        line: propagated.line,
        before: formatInstruction(propagated),
        after: formatInstruction(folded),
        explanation: "All operands are constants, so the result is computed at compile time.",
      });
    }

    recordResult(folded, known);
    forward.push(folded);
  }

  // Pass 2 (backward): remove instructions whose result is never used.
  const variableNames = new Set(symbolTable.map((symbol) => symbol.name));
  const dead = eliminateDeadCode(forward, variableNames);
  for (const { instruction, reason } of dead.removed) {
    steps.push({
      kind: "dead-code-elimination",
      stmt: instruction.stmt,
      line: instruction.line,
      before: formatInstruction(instruction),
      after: null,
      explanation: reason,
    });
  }

  const count = (kind: OptimizationKind) => steps.filter((s) => s.kind === kind).length;

  return {
    instructions: dead.instructions,
    steps,
    stats: {
      instructionsBefore: instructions.length,
      instructionsAfter: dead.instructions.length,
      propagations: count("constant-propagation"),
      foldings: count("constant-folding"),
      eliminations: count("dead-code-elimination"),
    },
  };
}
