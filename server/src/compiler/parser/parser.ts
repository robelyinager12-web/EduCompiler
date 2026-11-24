import type {
  Assignment,
  BinaryOperator,
  DataType,
  Expression,
  PrintStatement,
  Program,
  Statement,
  VariableDeclaration,
} from "../ast/nodes";
import { createDiagnostic, type Diagnostic } from "../errors/CompilerError";
import { isTypeKeyword } from "../lexer/keywords";
import { TokenType, type Token } from "../lexer/token.types";

export interface ParseResult {
  program: Program;
  errors: Diagnostic[];
}

// Thrown inside the parser to jump out of a broken statement.
// It never leaves this file: parse() catches it and records a diagnostic.
class ParseError extends Error {}

const MAX_NESTING = 200;

const COMPARISON_OPS: readonly TokenType[] = [
  TokenType.EQUAL_EQUAL,
  TokenType.BANG_EQUAL,
  TokenType.LESS,
  TokenType.GREATER,
  TokenType.LESS_EQUAL,
  TokenType.GREATER_EQUAL,
];
const ADDITIVE_OPS: readonly TokenType[] = [TokenType.PLUS, TokenType.MINUS];
const MULTIPLICATIVE_OPS: readonly TokenType[] = [TokenType.STAR, TokenType.SLASH];

class Parser {
  private readonly tokens: Token[];
  private current = 0;
  private depth = 0;
  private readonly errors: Diagnostic[] = [];

  constructor(tokens: Token[]) {
    this.tokens = [...tokens];
    // The grammar needs an EOF token at the end. Add one if it is missing.
    const last = this.tokens[this.tokens.length - 1];
    if (!last || last.type !== TokenType.EOF) {
      this.tokens.push({
        type: TokenType.EOF,
        lexeme: "",
        line: last ? last.line : 1,
        column: last ? last.column + last.lexeme.length : 1,
      });
    }
  }

  // program → statement* EOF
  parse(): ParseResult {
    const body: Statement[] = [];

    while (!this.isAtEnd()) {
      const start = this.current;
      try {
        body.push(this.statement());
      } catch (error) {
        if (!(error instanceof ParseError)) throw error;
        // Always move forward, otherwise a bad token could loop forever.
        if (this.current === start) this.advance();
        this.synchronize();
      }
    }

    return {
      program: { kind: "Program", body, line: 1, column: 1 },
      errors: this.errors,
    };
  }

  // ---------- Statements ----------

  // statement → variableDeclaration | assignment | printStatement
  private statement(): Statement {
    const token = this.peek();

    if (token.type === TokenType.KEYWORD) {
      if (isTypeKeyword(token.lexeme)) return this.variableDeclaration();
      if (token.lexeme === "print") return this.printStatement();
      if (token.lexeme === "if") {
        throw this.fail("'if' statements are not supported yet.", token);
      }
    }

    if (token.type === TokenType.IDENTIFIER) return this.assignment();

    throw this.unexpected(token);
  }

  // variableDeclaration → type IDENTIFIER ( "=" expression )? ";"
  private variableDeclaration(): VariableDeclaration {
    const typeToken = this.advance();

    if (!this.check(TokenType.IDENTIFIER)) {
      throw this.fail("Expected variable name after type.", this.peek());
    }
    const nameToken = this.advance();

    let initializer: Expression | null = null;
    if (this.match(TokenType.ASSIGNMENT_OPERATOR)) {
      initializer = this.expression();
    }
    this.consumeSemicolon();

    return {
      kind: "VariableDeclaration",
      varType: typeToken.lexeme as DataType,
      name: nameToken.lexeme,
      initializer,
      line: typeToken.line,
      column: typeToken.column,
    };
  }

  // assignment → IDENTIFIER "=" expression ";"
  private assignment(): Assignment {
    const nameToken = this.advance();

    if (!this.match(TokenType.ASSIGNMENT_OPERATOR)) {
      throw this.unexpected(this.peek());
    }
    const value = this.expression();
    this.consumeSemicolon();

    return {
      kind: "Assignment",
      name: nameToken.lexeme,
      value,
      line: nameToken.line,
      column: nameToken.column,
    };
  }

  // printStatement → "print" "(" expression ")" ";"
  private printStatement(): PrintStatement {
    const printToken = this.advance();

    if (!this.match(TokenType.LEFT_PAREN)) {
      throw this.fail("Expected '(' after 'print'.", this.peek());
    }
    const expression = this.expression();
    if (!this.match(TokenType.RIGHT_PAREN)) {
      throw this.fail("Expected ')' after expression.", this.peek());
    }
    this.consumeSemicolon();

    return {
      kind: "PrintStatement",
      expression,
      line: printToken.line,
      column: printToken.column,
    };
  }

  // ---------- Expressions (lowest precedence first) ----------

  // expression → comparison
  private expression(): Expression {
    return this.comparison();
  }

  // comparison → additive ( ("==" | "!=" | "<" | ">" | "<=" | ">=") additive )*
  private comparison(): Expression {
    return this.binary(() => this.additive(), COMPARISON_OPS);
  }

  // additive → multiplicative ( ("+" | "-") multiplicative )*
  private additive(): Expression {
    return this.binary(() => this.multiplicative(), ADDITIVE_OPS);
  }

  // multiplicative → unary ( ("*" | "/") unary )*
  private multiplicative(): Expression {
    return this.binary(() => this.unary(), MULTIPLICATIVE_OPS);
  }

  // The three levels above have the same shape, so they share this helper.
  // Looping (not recursing) on the right makes operators left-associative:
  // 10 - 3 - 2  becomes  (10 - 3) - 2
  private binary(next: () => Expression, operators: readonly TokenType[]): Expression {
    let left = next();

    while (operators.some((type) => this.check(type))) {
      const operatorToken = this.advance();
      const right = next();
      left = {
        kind: "Binary",
        operator: operatorToken.lexeme as BinaryOperator,
        left,
        right,
        // A binary node points at its operator, so errors like
        // "Operator '-' cannot be applied..." highlight the right place.
        line: operatorToken.line,
        column: operatorToken.column,
      };
    }
    return left;
  }

  // unary → "-" unary | primary
  private unary(): Expression {
    // Every level of nesting passes through unary(), so this guards the recursion.
    this.depth++;
    try {
      if (this.depth > MAX_NESTING) {
        throw this.fail("Expression is nested too deeply.", this.peek());
      }

      if (this.check(TokenType.MINUS)) {
        const operatorToken = this.advance();
        const operand = this.unary();
        return {
          kind: "Unary",
          operator: "-",
          operand,
          line: operatorToken.line,
          column: operatorToken.column,
        };
      }
      return this.primary();
    } finally {
      this.depth--;
    }
  }

  // primary → INTEGER | FLOAT | STRING | BOOLEAN | IDENTIFIER | "(" expression ")"
  private primary(): Expression {
    const token = this.peek();

    switch (token.type) {
      case TokenType.INTEGER_LITERAL:
        return this.literal("int");
      case TokenType.FLOAT_LITERAL:
        return this.literal("float");
      case TokenType.STRING_LITERAL:
        return this.literal("string");
      case TokenType.BOOLEAN_LITERAL:
        return this.literal("bool");
      case TokenType.IDENTIFIER:
        this.advance();
        return { kind: "Identifier", name: token.lexeme, line: token.line, column: token.column };
      case TokenType.LEFT_PAREN: {
        this.advance();
        const inner = this.expression();
        if (!this.match(TokenType.RIGHT_PAREN)) {
          throw this.fail("Expected ')' after expression.", this.peek());
        }
        return { kind: "Grouping", expression: inner, line: token.line, column: token.column };
      }
      default:
        throw this.fail("Expected expression.", token);
    }
  }

  private literal(valueType: DataType): Expression {
    const token = this.advance();
    return {
      kind: "Literal",
      valueType,
      value: token.value as number | string | boolean,
      line: token.line,
      column: token.column,
    };
  }

  // ---------- Error handling ----------

  // Records a diagnostic and returns the exception to throw.
  private fail(message: string, token: Token): ParseError {
    this.errors.push(createDiagnostic("syntax", message, token.line, token.column));
    return new ParseError(message);
  }

  private unexpected(token: Token): ParseError {
    const message =
      token.type === TokenType.EOF
        ? "Unexpected end of input."
        : `Unexpected token '${token.lexeme}'.`;
    return this.fail(message, token);
  }

  // A missing ';' is reported just after the previous token, where it belongs.
  private consumeSemicolon(): void {
    if (this.match(TokenType.SEMICOLON)) return;

    const previous = this.previous();
    this.errors.push(
      createDiagnostic(
        "syntax",
        "Expected ';' after statement.",
        previous.line,
        previous.column + previous.lexeme.length,
      ),
    );
    throw new ParseError("Expected ';' after statement.");
  }

  // Panic-mode recovery: skip tokens until a likely statement boundary.
  private synchronize(): void {
    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;
      if (this.isStatementStart()) return;
      this.advance();
    }
  }

  private isStatementStart(): boolean {
    const token = this.peek();
    if (token.type === TokenType.KEYWORD) {
      return isTypeKeyword(token.lexeme) || token.lexeme === "print" || token.lexeme === "if";
    }
    // An identifier at the start of a new line probably begins an assignment.
    if (token.type === TokenType.IDENTIFIER) return token.line > this.previous().line;
    return false;
  }

  // ---------- Token helpers ----------

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private check(type: TokenType): boolean {
    return this.peek().type === type;
  }

  private match(type: TokenType): boolean {
    if (!this.check(type)) return false;
    this.advance();
    return true;
  }
}

export function parse(tokens: Token[]): ParseResult {
  return new Parser(tokens).parse();
}
