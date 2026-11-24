export type DataType = "int" | "float" | "string" | "bool";

interface BaseNode {
  line: number;
  column: number;
}

export type BinaryOperator = "+" | "-" | "*" | "/" | "==" | "!=" | "<" | ">" | "<=" | ">=";

export interface LiteralExpression extends BaseNode {
  kind: "Literal";
  valueType: DataType;
  value: number | string | boolean;
}

export interface IdentifierExpression extends BaseNode {
  kind: "Identifier";
  name: string;
}

export interface UnaryExpression extends BaseNode {
  kind: "Unary";
  operator: "-";
  operand: Expression;
}

export interface BinaryExpression extends BaseNode {
  kind: "Binary";
  operator: BinaryOperator;
  left: Expression;
  right: Expression;
}

export interface GroupingExpression extends BaseNode {
  kind: "Grouping";
  expression: Expression;
}

export type Expression =
  | LiteralExpression
  | IdentifierExpression
  | UnaryExpression
  | BinaryExpression
  | GroupingExpression;

export interface VariableDeclaration extends BaseNode {
  kind: "VariableDeclaration";
  varType: DataType;
  name: string;
  initializer: Expression | null;
}

export interface Assignment extends BaseNode {
  kind: "Assignment";
  name: string;
  value: Expression;
}

export interface PrintStatement extends BaseNode {
  kind: "PrintStatement";
  expression: Expression;
}

export type Statement = VariableDeclaration | Assignment | PrintStatement;

export interface Program extends BaseNode {
  kind: "Program";
  body: Statement[];
}

export type AstNode = Program | Statement | Expression;
