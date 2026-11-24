import type { TargetInstruction } from "./target.types";

export function formatTargetInstruction(instruction: TargetInstruction): string {
  return `${instruction.opcode} ${instruction.operands.join(", ")}`;
}

export function formatTarget(instructions: TargetInstruction[]): string {
  const lines: string[] = [];
  let previousStmt: number | null = null;

  for (const instruction of instructions) {
    if (previousStmt !== null && instruction.stmt !== previousStmt) lines.push("");
    lines.push(formatTargetInstruction(instruction));
    previousStmt = instruction.stmt;
  }
  return lines.join("\n");
}
