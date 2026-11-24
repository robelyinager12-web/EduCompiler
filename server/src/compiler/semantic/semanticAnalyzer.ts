import type { Expression, Program, Statement } from "../ast/nodes";
import { createDiagnostic, type Diagnostic } from "../errors/CompilerError";
import { SymbolTable, type SymbolEntry, type SymbolValue } from "../symbol-table/symbolTable";
import {
  binaryResultType,
  constantValue,
  isAssignable,
  isNumeric,
  typeName,
  type ExprType,
} from "./typeChecker";

export interface SemanticResult {
  symbolTable: SymbolEntry[];
  errors: Diagnostic[];
  warnings: Diagnostic[];
}

interface Position {
  line: number;
  column: number;
}

class Analyzer {
  private readonly table = new SymbolTable();
  private readonly diagnostics: Diagnostic[] = [];

  analyze(program: Program): SemanticResult {
    for (const statement of program.body) this.statement(statement);

    // Report in source order, even where checking happened in another order.
    const sorted = [...this.diagnostics].sort(
      (a, b) => a.line - b.line || a.column - b.column,
    );

    return {
      symbolTable: this.table.entries(),
      errors: sorted.filter((d) => d.severity === "error"),
      warnings: sorted.filter((d) => d.severity === "warning"),
    };
  }

  // ---------- Statements ----------

  private statement(stmt: Statement): void {
    switch (stmt.kind) {
      case "VariableDeclaration": {
        // The initializer is checked BEFORE the name is declared.
        const initType = stmt.initializer ? this.expression(stmt.initializer) : null;

        let value: SymbolValue = null;
        if (stmt.initializer && initType !== null && initType !== "error") {
          if (isAssignable(stmt.varType, initType)) {
            value = constantValue(stmt.initializer) ?? null;
          } else {
            this.error(
              `Cannot assign ${typeName(initType)} to ${typeName(stmt.varType)}.`,
              stmt,
            );
          }
        }

        const declared = this.table.declare({
          name: stmt.name,
          type: stmt.varType,
          value,
          line: stmt.line,
          initialized: stmt.initializer !== null,
        });
        if (!declared) {
          this.error(`Variable '${stmt.name}' is already declared in this scope.`, stmt);
        }
        return;
      }

      case "Assignment": {
        // Check the right side first, so 'x = x + 1' sees x before it is assigned.
        const valueType = this.expression(stmt.value);
        const symbol = this.table.lookup(stmt.name);

        if (!symbol) {
          this.error(`Undeclared variable '${stmt.name}'.`, stmt);
          return;
        }
        if (valueType !== "error" && !isAssignable(symbol.type, valueType)) {
          this.error(`Cannot assign ${typeName(valueType)} to ${typeName(symbol.type)}.`, stmt);
        }
        symbol.initialized = true;
        return;
      }

      case "PrintStatement":
        this.expression(stmt.expression);
        return;
    }
  }

  // ---------- Expressions ----------

  private expression(expr: Expression): ExprType {
    switch (expr.kind) {
      case "Literal":
        return expr.valueType;

      case "Grouping":
        return this.expression(expr.expression);

      case "Identifier": {
        const symbol = this.table.lookup(expr.name);
        if (!symbol) {
          this.error(`Undeclared variable '${expr.name}'.`, expr);
          return "error";
        }
        if (!symbol.initialized) {
          this.warning(`Variable '${expr.name}' is used before it is assigned.`, expr);
        }
        return symbol.type;
      }

      case "Unary": {
        const operand = this.expression(expr.operand);
        if (operand === "error") return "error";
        if (!isNumeric(operand)) {
          this.error(`Operator '-' cannot be applied to ${typeName(operand)}.`, expr);
          return "error";
        }
        return operand;
      }

      case "Binary": {
        const left = this.expression(expr.left);
        const right = this.expression(expr.right);

        if (expr.operator === "/" && constantValue(expr.right) === 0) {
          this.error("Division by zero.", expr);
        }
        if (left === "error" || right === "error") return "error";

        const result = binaryResultType(expr.operator, left, right);
        if (result === null) {
          this.error(
            `Operator '${expr.operator}' cannot be applied to ${typeName(left)} and ${typeName(right)}.`,
            expr,
          );
          return "error";
        }
        return result;
      }
    }
  }

  // ---------- Diagnostics ----------

  private error(message: string, at: Position): void {
    this.diagnostics.push(createDiagnostic("semantic", message, at.line, at.column));
  }

  private warning(message: string, at: Position): void {
    this.diagnostics.push(createDiagnostic("semantic", message, at.line, at.column, "warning"));
  }
}

export function analyze(program: Program): SemanticResult {
  return new Analyzer().analyze(program);
}
