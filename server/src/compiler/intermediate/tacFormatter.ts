import type { Operand, TacInstruction } from "./tac.types";

export function formatOperand(operand: Operand): string {
  if (operand.kind !== "const") return operand.name;

  const { value, valueType } = operand;
  if (typeof value === "string") return JSON.stringify(value);
  // Show 2.0 for a float constant, so it is not mistaken for an int.
  if (valueType === "float" && typeof value === "number" && Number.isInteger(value)) {
    return value.toFixed(1);
  }
  return String(value);
}

export function formatInstruction(instruction: TacInstruction): string {
  switch (instruction.op) {
    case "copy":
      return `${instruction.dest} = ${formatOperand(instruction.src)}`;
    case "unary":
      return `${instruction.dest} = -${formatOperand(instruction.operand)}`;
    case "binary":
      return `${instruction.dest} = ${formatOperand(instruction.left)} ${instruction.operator} ${formatOperand(instruction.right)}`;
    case "print":
      return `print ${formatOperand(instruction.operand)}`;
  }
}

// One blank line between the instructions of different statements.
export function formatTac(instructions: TacInstruction[]): string {
  const lines: string[] = [];
  let previousStmt: number | null = null;

  for (const instruction of instructions) {
    if (previousStmt !== null && instruction.stmt !== previousStmt) lines.push("");
    lines.push(formatInstruction(instruction));
    previousStmt = instruction.stmt;
  }
  return lines.join("\n");
}
