import type { DataType } from "../ast/nodes";

export const TYPE_KEYWORDS: readonly DataType[] = ["int", "float", "string", "bool"];

export const KEYWORDS: ReadonlySet<string> = new Set([
  ...TYPE_KEYWORDS,
  "print",
  "if",
  "else",
]);

export const BOOLEAN_LITERALS: ReadonlySet<string> = new Set(["true", "false"]);

export function isTypeKeyword(lexeme: string): lexeme is DataType {
  return (TYPE_KEYWORDS as readonly string[]).includes(lexeme);
}
