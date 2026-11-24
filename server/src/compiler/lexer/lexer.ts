import { createDiagnostic, type Diagnostic } from "../errors/CompilerError";
import { BOOLEAN_LITERALS, KEYWORDS } from "./keywords";
import { TokenType, type Token } from "./token.types";

export interface LexResult {
  tokens: Token[];
  errors: Diagnostic[];
}

const MAX_INT = 2147483647;

const SINGLE_CHAR: Record<string, TokenType> = {
  "+": TokenType.PLUS,
  "-": TokenType.MINUS,
  "*": TokenType.STAR,
  "/": TokenType.SLASH,
  "(": TokenType.LEFT_PAREN,
  ")": TokenType.RIGHT_PAREN,
  "{": TokenType.LEFT_BRACE,
  "}": TokenType.RIGHT_BRACE,
  ";": TokenType.SEMICOLON,
};

const isDigit = (c: string) => c >= "0" && c <= "9";
const isLetter = (c: string) => (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
const isAlphaNumeric = (c: string) => isLetter(c) || isDigit(c);

export function tokenize(source: string): LexResult {
  const tokens: Token[] = [];
  const errors: Diagnostic[] = [];

  let pos = 0;
  let line = 1;
  let column = 1;

  const peek = (offset = 0) => source[pos + offset] ?? "\0";
  const atEnd = () => pos >= source.length;

  // Moves forward one character and keeps line/column correct.
  function advance(): string {
    const c = source[pos++];
    if (c === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
    return c;
  }

  function add(type: TokenType, lexeme: string, startLine: number, startCol: number, value?: Token["value"]) {
    const token: Token = { type, lexeme, line: startLine, column: startCol };
    if (value !== undefined) token.value = value;
    tokens.push(token);
  }

  function scanNumber(startLine: number, startCol: number) {
    let text = "";
    while (isDigit(peek())) text += advance();

    // A dot starts a float only if a digit follows it.
    if (peek() === "." && isDigit(peek(1))) {
      text += advance();
      while (isDigit(peek())) text += advance();
      add(TokenType.FLOAT_LITERAL, text, startLine, startCol, Number(text));
      return;
    }

    const value = Number(text);
    if (value > MAX_INT) {
      errors.push(createDiagnostic("lexical", `Integer literal '${text}' is out of range.`, startLine, startCol));
      return;
    }
    add(TokenType.INTEGER_LITERAL, text, startLine, startCol, value);
  }

  function scanIdentifier(startLine: number, startCol: number) {
    let text = "";
    while (isAlphaNumeric(peek())) text += advance();

    if (BOOLEAN_LITERALS.has(text)) {
      add(TokenType.BOOLEAN_LITERAL, text, startLine, startCol, text === "true");
    } else if (KEYWORDS.has(text)) {
      add(TokenType.KEYWORD, text, startLine, startCol);
    } else {
      add(TokenType.IDENTIFIER, text, startLine, startCol);
    }
  }

  function scanString(startLine: number, startCol: number) {
    advance(); // opening quote
    let raw = "\"";
    let value = "";
    let closed = false;

    while (!atEnd() && peek() !== "\n") {
      const c = advance();
      raw += c;

      if (c === "\"") {
        closed = true;
        break;
      }

      if (c === "\\") {
        if (atEnd() || peek() === "\n") break;
        const escapeLine = line;
        const escapeCol = column - 1;
        const next = advance();
        raw += next;
        if (next === "n") value += "\n";
        else if (next === "\"") value += "\"";
        else if (next === "\\") value += "\\";
        else {
          errors.push(
            createDiagnostic("lexical", `Invalid escape sequence '\\${next}' in string.`, escapeLine, escapeCol),
          );
        }
      } else {
        value += c;
      }
    }

    if (!closed) {
      errors.push(createDiagnostic("lexical", "Unterminated string literal.", startLine, startCol));
      return;
    }
    add(TokenType.STRING_LITERAL, raw, startLine, startCol, value);
  }

  while (!atEnd()) {
    const startLine = line;
    const startCol = column;
    const c = peek();

    // Whitespace
    if (c === " " || c === "\t" || c === "\r" || c === "\n") {
      advance();
      continue;
    }

    // Comment: // to the end of the line
    if (c === "/" && peek(1) === "/") {
      while (!atEnd() && peek() !== "\n") advance();
      continue;
    }

    if (isDigit(c)) {
      scanNumber(startLine, startCol);
      continue;
    }

    if (isLetter(c)) {
      scanIdentifier(startLine, startCol);
      continue;
    }

    if (c === "\"") {
      scanString(startLine, startCol);
      continue;
    }

    // Operators that may have two characters
    if (c === "=" || c === "!" || c === "<" || c === ">") {
      advance();
      if (peek() === "=") {
        advance();
        const two = c + "=";
        const type =
          c === "=" ? TokenType.EQUAL_EQUAL
          : c === "!" ? TokenType.BANG_EQUAL
          : c === "<" ? TokenType.LESS_EQUAL
          : TokenType.GREATER_EQUAL;
        add(type, two, startLine, startCol);
      } else if (c === "!") {
        // A lone '!' is not part of EduLang v1.0
        errors.push(createDiagnostic("lexical", "Invalid character '!'.", startLine, startCol));
      } else {
        const type =
          c === "=" ? TokenType.ASSIGNMENT_OPERATOR
          : c === "<" ? TokenType.LESS
          : TokenType.GREATER;
        add(type, c, startLine, startCol);
      }
      continue;
    }

    const single = SINGLE_CHAR[c];
    if (single) {
      advance();
      add(single, c, startLine, startCol);
      continue;
    }

    // Anything else is invalid; report it and keep scanning.
    advance();
    errors.push(createDiagnostic("lexical", `Invalid character '${c}'.`, startLine, startCol));
  }

  add(TokenType.EOF, "", line, column);
  return { tokens, errors };
}
