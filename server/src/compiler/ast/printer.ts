import type { Expression, Program, Statement } from "./nodes";

// Prefix notation makes the tree shape visible: 1 + 2 * 3  ->  (+ 1 (* 2 3))
export function formatExpression(expr: Expression): string {
  switch (expr.kind) {
    case "Literal":
      return expr.valueType === "string" ? JSON.stringify(expr.value) : String(expr.value);
    case "Identifier":
      return expr.name;
    case "Unary":
      return `(${expr.operator} ${formatExpression(expr.operand)})`;
    case "Binary":
      return `(${expr.operator} ${formatExpression(expr.left)} ${formatExpression(expr.right)})`;
    case "Grouping":
      return `(group ${formatExpression(expr.expression)})`;
  }
}

export function formatStatement(stmt: Statement): string {
  switch (stmt.kind) {
    case "VariableDeclaration":
      return stmt.initializer
        ? `${stmt.varType} ${stmt.name} = ${formatExpression(stmt.initializer)}`
        : `${stmt.varType} ${stmt.name}`;
    case "Assignment":
      return `${stmt.name} = ${formatExpression(stmt.value)}`;
    case "PrintStatement":
      return `print ${formatExpression(stmt.expression)}`;
  }
}

export function formatProgram(program: Program): string {
  return program.body.map(formatStatement).join("\n");
}
