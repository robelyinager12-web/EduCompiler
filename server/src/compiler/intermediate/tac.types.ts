import type { DataType } from "../ast/nodes";

export type Operand =
  | { kind: "temp"; name: string }
  | { kind: "var"; name: string }
  | { kind: "const"; valueType: DataType; value: number | string | boolean };

interface BaseInstruction {
  stmt: number; // index of the source statement
  line: number; // source line of that statement
}

// dest = src
export interface CopyInstruction extends BaseInstruction {
  op: "copy";
  dest: string;
  src: Operand;
  type: DataType; // type of the value stored in dest
}

// dest = -operand
export interface UnaryInstruction extends BaseInstruction {
  op: "unary";
  dest: string;
  operand: Operand;
  type: DataType;
}

// dest = left operator right
// "type" is the RESULT type: for "/", int means integer division.
export interface BinaryInstruction extends BaseInstruction {
  op: "binary";
  dest: string;
  operator: "+" | "-" | "*" | "/" | "==" | "!=" | "<" | ">" | "<=" | ">=";
  left: Operand;
  right: Operand;
  type: DataType;
}

// print operand
export interface PrintInstruction extends BaseInstruction {
  op: "print";
  operand: Operand;
}

export type TacInstruction =
  | CopyInstruction
  | UnaryInstruction
  | BinaryInstruction
  | PrintInstruction;
