import type {
  BinaryInstruction,
  CopyInstruction,
  Operand,
  TacInstruction,
  UnaryInstruction,
} from "../intermediate/tac.types";
import { formatInstruction, formatOperand } from "../intermediate/tacFormatter";
import type { SymbolEntry } from "../symbol-table/symbolTable";
import { formatTargetInstruction } from "./targetFormatter";
import {
  TARGET_NOTE,
  type Opcode,
  type TargetInstruction,
  type TargetMapping,
  type TargetResult,
} from "./target.types";

const INT_OPS: Record<string, Opcode> = { "+": "ADD", "-": "SUB", "*": "MUL", "/": "DIV" };
const FLOAT_OPS: Record<string, Opcode> = { "+": "FADD", "-": "FSUB", "*": "FMUL", "/": "FDIV" };
const COMPARE_OPS: Record<string, Opcode> = {
  "==": "CMPEQ",
  "!=": "CMPNE",
  "<": "CMPLT",
  ">": "CMPGT",
  "<=": "CMPLE",
  ">=": "CMPGE",
};

function binaryOpcode(instruction: BinaryInstruction): Opcode {
  const { operator, type } = instruction;
  if (operator in COMPARE_OPS) return COMPARE_OPS[operator];
  if (operator === "+" && type === "string") return "CONCAT";
  return type === "float" ? FLOAT_OPS[operator] : INT_OPS[operator];
}

class Generator {
  private readonly out: TargetInstruction[] = [];
  private readonly registers = new Map<string, string>();
  private readonly variables: ReadonlySet<string>;
  private regCount = 0;
  private index = 0;
  private stmt = 0;
  private line = 1;

  constructor(variables: ReadonlySet<string>) {
    this.variables = variables;
  }

  generate(instructions: TacInstruction[]): TargetResult {
    instructions.forEach((instruction, i) => {
      this.index = i;
      this.stmt = instruction.stmt;
      this.line = instruction.line;
      this.instruction(instruction);
    });

    const byTac = new Map<number, string[]>();
    for (const t of this.out) {
      const list = byTac.get(t.tacIndex) ?? [];
      list.push(formatTargetInstruction(t));
      byTac.set(t.tacIndex, list);
    }
    const mapping: TargetMapping[] = instructions.map((instruction, i) => ({
      tacIndex: i,
      line: instruction.line,
      tac: formatInstruction(instruction),
      target: byTac.get(i) ?? [],
    }));

    return {
      instructions: this.out,
      mapping,
      registersUsed: this.regCount,
      note: TARGET_NOTE,
    };
  }

  private instruction(instruction: TacInstruction): void {
    switch (instruction.op) {
      case "copy":
        this.copy(instruction);
        return;
      case "unary":
        this.unary(instruction);
        return;
      case "binary":
        this.binary(instruction);
        return;
      case "print":
        this.emit("PRINT", [this.operand(instruction.operand)], "Show the value.");
        return;
    }
  }

  private copy(i: CopyInstruction): void {
    const src = i.src;

    if (this.variables.has(i.dest)) {
      if (src.kind === "var") {
        const scratch = this.newReg();
        this.emit("LOAD", [scratch, `[${src.name}]`], `Load ${src.name} into ${scratch}.`);
        this.emit("STORE", [`[${i.dest}]`, scratch], `Store ${scratch} into ${i.dest}.`);
      } else {
        const value = this.operand(src);
        this.emit("STORE", [`[${i.dest}]`, value], `Store ${value} into ${i.dest}.`);
      }
      return;
    }

    const value = this.operand(src);
    const reg = this.regFor(i.dest);
    if (src.kind === "temp") {
      this.emit("MOVE", [reg, value], `Copy ${value} into ${reg}.`);
    } else {
      this.emit("LOAD", [reg, value], `Load ${value} into ${reg}.`);
    }
  }

  private unary(i: UnaryInstruction): void {
    const operand = this.operand(i.operand);
    const reg = this.regFor(i.dest);
    const opcode: Opcode = i.type === "float" ? "FNEG" : "NEG";
    this.emit(opcode, [reg, operand], `${reg} = -${operand}.`);
    this.storeIfVariable(i.dest, reg);
  }

  private binary(i: BinaryInstruction): void {
    const left = this.operand(i.left);
    const right = this.operand(i.right);
    const reg = this.regFor(i.dest);
    const note = i.operator === "/" && i.type === "int" ? " (integer division)" : "";
    this.emit(binaryOpcode(i), [reg, left, right], `${reg} = ${left} ${i.operator} ${right}${note}.`);
    this.storeIfVariable(i.dest, reg);
  }

  private storeIfVariable(dest: string, reg: string): void {
    if (this.variables.has(dest)) {
      this.emit("STORE", [`[${dest}]`, reg], `Store ${reg} into ${dest}.`);
    }
  }

  private operand(operand: Operand): string {
    switch (operand.kind) {
      case "temp":
        return this.regFor(operand.name);
      case "var":
        return `[${operand.name}]`;
      case "const":
        return `#${formatOperand(operand)}`;
    }
  }

  private regFor(name: string): string {
    const existing = this.registers.get(name);
    if (existing) return existing;
    const reg = this.newReg();
    this.registers.set(name, reg);
    return reg;
  }

  private newReg(): string {
    this.regCount++;
    return `R${this.regCount}`;
  }

  private emit(opcode: Opcode, operands: string[], explanation: string): void {
    this.out.push({
      opcode,
      operands,
      tacIndex: this.index,
      stmt: this.stmt,
      line: this.line,
      explanation,
    });
  }
}

export function generateTarget(
  instructions: TacInstruction[],
  symbolTable: SymbolEntry[],
): TargetResult {
  const variables = new Set(symbolTable.map((symbol) => symbol.name));
  return new Generator(variables).generate(instructions);
}
