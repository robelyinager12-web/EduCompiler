import type { BinaryOperator, DataType, Expression } from "../ast/nodes";

// "error" marks an expression that already produced a diagnostic.
export type ExprType = DataType | "error";

export const typeName = (type: DataType): string => type.toUpperCase();

export const isNumeric = (type: DataType): boolean => type === "int" || type === "float";

// int widens to float. Everything else must match exactly.
export function isAssignable(target: DataType, source: DataType): boolean {
  return target === source || (target === "float" && source === "int");
}

// Returns the result type, or null if the operator cannot be applied.
export function binaryResultType(
  operator: BinaryOperator,
  left: DataType,
  right: DataType,
): DataType | null {
  const numeric = isNumeric(left) && isNumeric(right);
  const bothInt = left === "int" && right === "int";

  switch (operator) {
    case "+":
      if (left === "string" && right === "string") return "string";
      return numeric ? (bothInt ? "int" : "float") : null;
    case "-":
    case "*":
    case "/":
      return numeric ? (bothInt ? "int" : "float") : null;
    case "==":
    case "!=":
      return numeric || left === right ? "bool" : null;
    case "<":
    case ">":
    case "<=":
    case ">=":
      return numeric ? "bool" : null;
  }
}

// The value of an expression if it is a plain constant, otherwise undefined.
// Handles literals, parentheses and unary minus on a numeric constant.
export function constantValue(expr: Expression): number | string | boolean | undefined {
  switch (expr.kind) {
    case "Literal":
      return expr.value;
    case "Grouping":
      return constantValue(expr.expression);
    case "Unary": {
      const inner = constantValue(expr.operand);
      return typeof inner === "number" ? -inner : undefined;
    }
    default:
      return undefined;
  }
}
