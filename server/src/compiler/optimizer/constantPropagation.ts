import type { Operand, TacInstruction } from "../intermediate/tac.types";
import { formatOperand } from "../intermediate/tacFormatter";
import type { ConstOperand } from "./constantFolding";

// Maps a variable or temporary name to the constant it currently holds.
// Temp names never collide with variable names (see Phase 8), so one map is enough.
export type KnownConstants = Map<string, ConstOperand>;

export interface PropagationResult {
  instruction: TacInstruction;
  replaced: string[]; // e.g. ["t1 = 10"]
}

export function propagate(instruction: TacInstruction, known: KnownConstants): PropagationResult {
  const replaced: string[] = [];

  const sub = (operand: Operand): Operand => {
    if (operand.kind === "const") return operand;
    const value = known.get(operand.name);
    if (!value) return operand;
    replaced.push(`${operand.name} = ${formatOperand(value)}`);
    return value;
  };

  switch (instruction.op) {
    case "copy": {
      let src = sub(instruction.src);
      // Make int to float widening visible: "tax = 2" becomes "tax = 2.0".
      if (src.kind === "const" && src.valueType === "int" && instruction.type === "float") {
        src = { ...src, valueType: "float" };
      }
      return { instruction: { ...instruction, src }, replaced };
    }
    case "unary":
      return { instruction: { ...instruction, operand: sub(instruction.operand) }, replaced };
    case "binary":
      return {
        instruction: { ...instruction, left: sub(instruction.left), right: sub(instruction.right) },
        replaced,
      };
    case "print":
      return { instruction: { ...instruction, operand: sub(instruction.operand) }, replaced };
  }
}

// After an instruction runs, remember (or forget) what its destination holds.
export function recordResult(instruction: TacInstruction, known: KnownConstants): void {
  if (instruction.op === "print") return;

  if (instruction.op === "copy" && instruction.src.kind === "const") {
    // The stored constant takes the destination's type (int widened to float).
    known.set(instruction.dest, {
      kind: "const",
      valueType: instruction.type,
      value: instruction.src.value,
    });
  } else {
    known.delete(instruction.dest);
  }
}
