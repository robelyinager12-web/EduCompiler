import type { DataType } from "../ast/nodes";
import type {
  BinaryInstruction,
  Operand,
  TacInstruction,
  UnaryInstruction,
} from "../intermediate/tac.types";

export type ConstOperand = Extract<Operand, { kind: "const" }>;
type Value = number | string | boolean;

const INT_MIN = -2147483648;
const INT_MAX = 2147483647;

// Returns undefined when folding would not be safe (overflow, NaN, Infinity).
function checkedNumber(value: number, type: DataType): number | undefined {
  if (!Number.isFinite(value)) return undefined;
  if (type === "int" && (value < INT_MIN || value > INT_MAX)) return undefined;
  return value === 0 ? 0 : value; // avoid -0
}

function foldBinary(
  operator: BinaryInstruction["operator"],
  left: Value,
  right: Value,
  type: DataType,
): Value | undefined {
  if (typeof left === "number" && typeof right === "number") {
    switch (operator) {
      case "+":
        return checkedNumber(left + right, type);
      case "-":
        return checkedNumber(left - right, type);
      case "*":
        return checkedNumber(left * right, type);
      case "/":
        // Never fold a division by zero. It stays visible in the code.
        if (right === 0) return undefined;
        // An int result means integer division, truncated toward zero.
        return checkedNumber(type === "int" ? Math.trunc(left / right) : left / right, type);
      case "==":
        return left === right;
      case "!=":
        return left !== right;
      case "<":
        return left < right;
      case ">":
        return left > right;
      case "<=":
        return left <= right;
      case ">=":
        return left >= right;
    }
  }

  if (typeof left === "string" && typeof right === "string") {
    if (operator === "+") return left + right;
    if (operator === "==") return left === right;
    if (operator === "!=") return left !== right;
  }

  if (typeof left === "boolean" && typeof right === "boolean") {
    if (operator === "==") return left === right;
    if (operator === "!=") return left !== right;
  }

  return undefined;
}

function constantCopy(
  instruction: BinaryInstruction | UnaryInstruction,
  value: Value,
): TacInstruction {
  return {
    op: "copy",
    stmt: instruction.stmt,
    line: instruction.line,
    dest: instruction.dest,
    src: { kind: "const", valueType: instruction.type, value },
    type: instruction.type,
  };
}

export interface FoldResult {
  instruction: TacInstruction;
  changed: boolean;
}

// Folds one instruction if all its operands are constants and it is safe to do so.
export function fold(instruction: TacInstruction): FoldResult {
  if (instruction.op === "binary") {
    const { left, right } = instruction;
    if (left.kind === "const" && right.kind === "const") {
      const value = foldBinary(instruction.operator, left.value, right.value, instruction.type);
      if (value !== undefined) {
        return { instruction: constantCopy(instruction, value), changed: true };
      }
    }
  }

  if (instruction.op === "unary") {
    const { operand } = instruction;
    if (operand.kind === "const" && typeof operand.value === "number") {
      const value = checkedNumber(-operand.value, instruction.type);
      if (value !== undefined) {
        return { instruction: constantCopy(instruction, value), changed: true };
      }
    }
  }

  return { instruction, changed: false };
}
