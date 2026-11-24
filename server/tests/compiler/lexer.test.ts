import { describe, expect, it } from "vitest";
import { tokenize } from "../../src/compiler/lexer";

const types = (src: string) => tokenize(src).tokens.map((t) => t.type);

describe("lexer: tokens", () => {
  it("tokenizes the example from the specification", () => {
    const { tokens, errors } = tokenize("int age = 20;\nprint(age);");
    expect(errors).toEqual([]);
    expect(tokens.map((t) => [t.lexeme, t.type])).toEqual([
      ["int", "KEYWORD"],
      ["age", "IDENTIFIER"],
      ["=", "ASSIGNMENT_OPERATOR"],
      ["20", "INTEGER_LITERAL"],
      [";", "SEMICOLON"],
      ["print", "KEYWORD"],
      ["(", "LEFT_PAREN"],
      ["age", "IDENTIFIER"],
      [")", "RIGHT_PAREN"],
      [";", "SEMICOLON"],
      ["", "EOF"],
    ]);
  });

  it("recognises all keywords", () => {
    for (const word of ["int", "float", "string", "bool", "print", "if", "else"]) {
      expect(types(word)[0]).toBe("KEYWORD");
    }
  });

  it("recognises identifiers, including underscores and digits", () => {
    const { tokens } = tokenize("_x1 total2");
    expect(tokens[0]).toMatchObject({ type: "IDENTIFIER", lexeme: "_x1" });
    expect(tokens[1]).toMatchObject({ type: "IDENTIFIER", lexeme: "total2" });
  });

  it("treats keyword prefixes as identifiers", () => {
    expect(types("integer")[0]).toBe("IDENTIFIER");
    expect(types("printer")[0]).toBe("IDENTIFIER");
  });

  it("converts boolean literals", () => {
    const { tokens } = tokenize("true false");
    expect(tokens[0]).toMatchObject({ type: "BOOLEAN_LITERAL", value: true });
    expect(tokens[1]).toMatchObject({ type: "BOOLEAN_LITERAL", value: false });
  });

  it("scans integer and float literals", () => {
    const { tokens } = tokenize("42 2.5 0");
    expect(tokens[0]).toMatchObject({ type: "INTEGER_LITERAL", value: 42 });
    expect(tokens[1]).toMatchObject({ type: "FLOAT_LITERAL", value: 2.5 });
    expect(tokens[2]).toMatchObject({ type: "INTEGER_LITERAL", value: 0 });
  });

  it("does not make a float from '3.' without digits after the dot", () => {
    const { tokens, errors } = tokenize("3.");
    expect(tokens[0]).toMatchObject({ type: "INTEGER_LITERAL", value: 3 });
    expect(errors[0].message).toBe("Invalid character '.'.");
  });

  it("scans string literals and escapes", () => {
    const { tokens, errors } = tokenize('"Hello" "a\\nb" "say \\"hi\\""');
    expect(errors).toEqual([]);
    expect(tokens[0]).toMatchObject({ type: "STRING_LITERAL", value: "Hello" });
    expect(tokens[1].value).toBe("a\nb");
    expect(tokens[2].value).toBe('say "hi"');
  });

  it("scans every operator", () => {
    expect(types("+ - * / = == != < > <= >=").slice(0, -1)).toEqual([
      "PLUS", "MINUS", "STAR", "SLASH", "ASSIGNMENT_OPERATOR",
      "EQUAL_EQUAL", "BANG_EQUAL", "LESS", "GREATER", "LESS_EQUAL", "GREATER_EQUAL",
    ]);
  });

  it("scans punctuation", () => {
    expect(types("( ) { } ;").slice(0, -1)).toEqual([
      "LEFT_PAREN", "RIGHT_PAREN", "LEFT_BRACE", "RIGHT_BRACE", "SEMICOLON",
    ]);
  });

  it("ignores whitespace and comments", () => {
    const { tokens, errors } = tokenize("  int x; // a comment\n\t// another\nprint(x);");
    expect(errors).toEqual([]);
    expect(tokens.filter((t) => t.lexeme === "//")).toEqual([]);
    expect(tokens.map((t) => t.lexeme).join(" ")).toBe("int x ; print ( x ) ; ");
  });

  it("returns only EOF for empty input", () => {
    expect(types("")).toEqual(["EOF"]);
  });
});

describe("lexer: positions", () => {
  it("tracks line and column starting at 1", () => {
    const { tokens } = tokenize("int a;\n  print(a);");
    expect(tokens[0]).toMatchObject({ lexeme: "int", line: 1, column: 1 });
    expect(tokens[1]).toMatchObject({ lexeme: "a", line: 1, column: 5 });
    expect(tokens[3]).toMatchObject({ lexeme: "print", line: 2, column: 3 });
  });

  it("handles Windows line endings", () => {
    const { tokens } = tokenize("int a;\r\nint b;");
    expect(tokens.find((t) => t.lexeme === "b")).toMatchObject({ line: 2, column: 5 });
  });
});

describe("lexer: errors", () => {
  it("reports invalid characters with position and keeps scanning", () => {
    const { tokens, errors } = tokenize("int y = 3 $ 4;");
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      phase: "lexical",
      severity: "error",
      message: "Invalid character '$'.",
      line: 1,
      column: 11,
    });
    expect(tokens.map((t) => t.lexeme)).toContain("4");
  });

  it("reports every invalid character", () => {
    expect(tokenize("@ #").errors).toHaveLength(2);
  });

  it("reports a lone '!'", () => {
    expect(tokenize("!").errors[0].message).toBe("Invalid character '!'.");
  });

  it("reports an unterminated string", () => {
    const { errors } = tokenize('string s = "abc;');
    expect(errors[0]).toMatchObject({ message: "Unterminated string literal.", line: 1, column: 12 });
  });

  it("does not let a string run onto the next line", () => {
    const { tokens, errors } = tokenize('"abc\nint x;');
    expect(errors).toHaveLength(1);
    expect(tokens.map((t) => t.lexeme)).toContain("int");
  });

  it("reports an invalid escape sequence", () => {
    const { errors } = tokenize('"a\\qb"');
    expect(errors[0].message).toBe("Invalid escape sequence '\\q' in string.");
  });

  it("reports out-of-range integers", () => {
    const { errors } = tokenize("int big = 2147483648;");
    expect(errors[0].message).toBe("Integer literal '2147483648' is out of range.");
    expect(tokenize("2147483647").errors).toEqual([]);
  });
});
