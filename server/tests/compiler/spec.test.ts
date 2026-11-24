import { describe, expect, it } from "vitest";
import {
  BOOLEAN_LITERALS,
  KEYWORDS,
  TYPE_KEYWORDS,
  TokenType,
  isTypeKeyword,
} from "../../src/compiler/lexer";
import { createDiagnostic } from "../../src/compiler/errors/CompilerError";

describe("EduLang specification", () => {
  it("defines the four data types as keywords", () => {
    expect([...TYPE_KEYWORDS]).toEqual(["int", "float", "string", "bool"]);
    for (const type of TYPE_KEYWORDS) expect(KEYWORDS.has(type)).toBe(true);
  });

  it("reserves print, if and else", () => {
    for (const word of ["print", "if", "else"]) expect(KEYWORDS.has(word)).toBe(true);
  });

  it("does not treat true and false as keywords", () => {
    expect(BOOLEAN_LITERALS.has("true")).toBe(true);
    expect(KEYWORDS.has("true")).toBe(false);
  });

  it("recognises type keywords only", () => {
    expect(isTypeKeyword("int")).toBe(true);
    expect(isTypeKeyword("print")).toBe(false);
  });

  it("has unique token type names", () => {
    const values = Object.values(TokenType);
    expect(new Set(values).size).toBe(values.length);
  });

  it("creates diagnostics with positions", () => {
    const d = createDiagnostic("syntax", "Expected ';' after statement.", 3, 12);
    expect(d).toEqual({
      phase: "syntax",
      severity: "error",
      message: "Expected ';' after statement.",
      line: 3,
      column: 12,
    });
  });
});
