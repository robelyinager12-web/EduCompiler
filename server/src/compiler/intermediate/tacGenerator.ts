import type { DataType, Expression, Program, Statement } from "../ast/nodes";
import { binaryResultType } from "../semantic/typeChecker";
import type { SymbolEntry } from "../symbol-table/symbolTable";
import type { Operand, TacInstruction } from "./tac.types";

class Generator {
  private readonly instructions: TacInstruction[] = [];
  private readonly types = new Map<string, DataType>();
  private tempCount = 0;
  private stmtIndex = -1;
  private currentLine = 1;

  constructor(symbols: SymbolEntry[]) {
    // v1.0 has one scope, so the first declaration of a name is the only one.
    for (const symbol of symbols) {
      if (!this.types.has(symbol.name)) this.types.set(symbol.name, symbol.type);
    }
  }

  generate(program: Program): TacInstruction[] {
    for (const statement of program.body) this.statement(statement);
    return this.instructions;
  }

  // ---------- Statements ----------

  private statement(stmt: Statement): void {
    this.stmtIndex++;
    this.currentLine = stmt.line;

    switch (stmt.kind) {
      case "VariableDeclaration": {
        if (!stmt.initializer) return; // nothing to compute
        const src = this.toTemp(stmt.initializer);
        this.instructions.push({
          ...this.pos(),
          op: "copy",
          dest: stmt.name,
          src,
          type: stmt.varType,
        });
        return;
      }

      case "Assignment": {
        const src = this.toTemp(stmt.value);
        this.instructions.push({
          ...this.pos(),
          op: "copy",
          dest: stmt.name,
          src,
          type: this.typeOfName(stmt.name),
        });
        return;
      }

      case "PrintStatement": {
        const operand = this.expression(stmt.expression);
        this.instructions.push({ ...this.pos(), op: "print", operand });
        return;
      }
    }
  }

  // ---------- Expressions ----------

  // Returns the operand that holds the value, and emits any instructions needed.
  // Operations are emitted left to right, so a - b - c becomes (a - b) - c.
  private expression(expr: Expression): Operand {
    switch (expr.kind) {
      case "Literal":
        return { kind: "const", valueType: expr.valueType, value: expr.value };

      case "Identifier":
        return { kind: "var", name: expr.name };

      case "Grouping":
        return this.expression(expr.expression);

      case "Unary": {
        const operand = this.expression(expr.operand);
        const dest = this.newTemp();
        this.instructions.push({
          ...this.pos(),
          op: "unary",
          dest,
          operand,
          type: this.typeOf(expr),
        });
        return { kind: "temp", name: dest };
      }

      case "Binary": {
        const left = this.expression(expr.left);
        const right = this.expression(expr.right);
        const dest = this.newTemp();
        this.instructions.push({
          ...this.pos(),
          op: "binary",
          dest,
          operator: expr.operator,
          left,
          right,
          type: this.typeOf(expr),
        });
        return { kind: "temp", name: dest };
      }
    }
  }

  // Makes sure the value is in a temp: 10 becomes "t1 = 10".
  private toTemp(expr: Expression): Operand {
    const operand = this.expression(expr);
    if (operand.kind === "temp") return operand;

    const dest = this.newTemp();
    this.instructions.push({
      ...this.pos(),
      op: "copy",
      dest,
      src: operand,
      type: this.typeOf(expr),
    });
    return { kind: "temp", name: dest };
  }

  // ---------- Types ----------

  // The semantic analyzer already proved the program is valid,
  // so the checks below only guard against misuse.
  private typeOf(expr: Expression): DataType {
    switch (expr.kind) {
      case "Literal":
        return expr.valueType;
      case "Grouping":
        return this.typeOf(expr.expression);
      case "Identifier":
        return this.typeOfName(expr.name);
      case "Unary":
        return this.typeOf(expr.operand);
      case "Binary": {
        const result = binaryResultType(
          expr.operator,
          this.typeOf(expr.left),
          this.typeOf(expr.right),
        );
        if (result === null) throw this.misuse();
        return result;
      }
    }
  }

  private typeOfName(name: string): DataType {
    const type = this.types.get(name);
    if (type === undefined) throw this.misuse();
    return type;
  }

  private misuse(): Error {
    return new Error("Internal error: TAC generation needs a semantically valid program.");
  }

  // ---------- Helpers ----------

  private newTemp(): string {
    this.tempCount++;
    return `t${this.tempCount}`;
  }

  private pos() {
    return { stmt: this.stmtIndex, line: this.currentLine };
  }
}

export function generateTac(program: Program, symbolTable: SymbolEntry[]): TacInstruction[] {
  return new Generator(symbolTable).generate(program);
}
