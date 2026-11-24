export const INSTRUCTION_SET = {
  LOAD: "Copy a constant or a variable from memory into a register.",
  STORE: "Copy a register or a constant into a variable in memory.",
  MOVE: "Copy one register into another register.",
  ADD: "Integer addition.",
  SUB: "Integer subtraction.",
  MUL: "Integer multiplication.",
  DIV: "Integer division, truncated toward zero.",
  FADD: "Floating-point addition.",
  FSUB: "Floating-point subtraction.",
  FMUL: "Floating-point multiplication.",
  FDIV: "Floating-point division.",
  NEG: "Integer negation.",
  FNEG: "Floating-point negation.",
  CONCAT: "Join two strings.",
  CMPEQ: "Compare for equality. The result is true or false.",
  CMPNE: "Compare for inequality. The result is true or false.",
  CMPLT: "Compare: less than. The result is true or false.",
  CMPGT: "Compare: greater than. The result is true or false.",
  CMPLE: "Compare: less than or equal. The result is true or false.",
  CMPGE: "Compare: greater than or equal. The result is true or false.",
  PRINT: "Show a value.",
} as const;

export type Opcode = keyof typeof INSTRUCTION_SET;

export const TARGET_NOTE =
  "Educational pseudo-assembly for an imaginary register machine. It is not executable machine code.";

export interface TargetInstruction {
  opcode: Opcode;
  operands: string[];
  tacIndex: number;
  stmt: number;
  line: number;
  explanation: string;
}

export interface TargetMapping {
  tacIndex: number;
  line: number;
  tac: string;
  target: string[];
}

export interface TargetResult {
  instructions: TargetInstruction[];
  mapping: TargetMapping[];
  registersUsed: number;
  note: string;
}
