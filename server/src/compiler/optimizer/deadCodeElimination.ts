import type { Operand, TacInstruction } from "../intermediate/tac.types";

export interface RemovedInstruction {
  instruction: TacInstruction;
  reason: string;
}

export interface DeadCodeResult {
  instructions: TacInstruction[];
  removed: RemovedInstruction[];
}

function addUses(instruction: TacInstruction, live: Set<string>): void {
  const operands: Operand[] =
    instruction.op === "copy" ? [instruction.src]
    : instruction.op === "unary" ? [instruction.operand]
    : instruction.op === "binary" ? [instruction.left, instruction.right]
    : [instruction.operand];

  for (const operand of operands) {
    if (operand.kind !== "const") live.add(operand.name);
  }
}

// Only a division that might divide by zero is unsafe to delete.
function isRemovable(instruction: TacInstruction): boolean {
  if (instruction.op === "binary" && instruction.operator === "/") {
    const divisor = instruction.right;
    return divisor.kind === "const" && divisor.value !== 0;
  }
  return instruction.op !== "print";
}

// Walks backwards. A name is "live" if its value may still be read later.
// Variables are live at the end of the program, because their final values are
// part of the program's result. Temporaries are not.
export function eliminateDeadCode(
  instructions: TacInstruction[],
  variableNames: ReadonlySet<string>,
): DeadCodeResult {
  const live = new Set<string>(variableNames);
  const kept: TacInstruction[] = [];
  const removed: RemovedInstruction[] = [];

  for (let i = instructions.length - 1; i >= 0; i--) {
    const instruction = instructions[i];

    if (instruction.op === "print") {
      addUses(instruction, live);
      kept.push(instruction);
      continue;
    }

    if (!live.has(instruction.dest) && isRemovable(instruction)) {
      removed.push({
        instruction,
        reason: variableNames.has(instruction.dest)
          ? `'${instruction.dest}' is assigned again before this value is used.`
          : `The value of ${instruction.dest} is never used.`,
      });
      continue;
    }

    live.delete(instruction.dest);
    addUses(instruction, live);
    kept.push(instruction);
  }

  return { instructions: kept.reverse(), removed: removed.reverse() };
}
