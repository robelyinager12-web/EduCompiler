export const TokenType = {
  KEYWORD: "KEYWORD",
  IDENTIFIER: "IDENTIFIER",
  INTEGER_LITERAL: "INTEGER_LITERAL",
  FLOAT_LITERAL: "FLOAT_LITERAL",
  STRING_LITERAL: "STRING_LITERAL",
  BOOLEAN_LITERAL: "BOOLEAN_LITERAL",
  ASSIGNMENT_OPERATOR: "ASSIGNMENT_OPERATOR",
  PLUS: "PLUS",
  MINUS: "MINUS",
  STAR: "STAR",
  SLASH: "SLASH",
  EQUAL_EQUAL: "EQUAL_EQUAL",
  BANG_EQUAL: "BANG_EQUAL",
  LESS: "LESS",
  GREATER: "GREATER",
  LESS_EQUAL: "LESS_EQUAL",
  GREATER_EQUAL: "GREATER_EQUAL",
  LEFT_PAREN: "LEFT_PAREN",
  RIGHT_PAREN: "RIGHT_PAREN",
  LEFT_BRACE: "LEFT_BRACE",
  RIGHT_BRACE: "RIGHT_BRACE",
  SEMICOLON: "SEMICOLON",
  EOF: "EOF",
} as const;

export type TokenType = (typeof TokenType)[keyof typeof TokenType];

export interface Token {
  type: TokenType;
  lexeme: string;
  value?: number | string | boolean;
  line: number;
  column: number;
}
