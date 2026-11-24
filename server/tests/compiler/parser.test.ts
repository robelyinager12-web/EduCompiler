import { describe, expect, it } from "vitest";
import { formatExpression } from "../../src/compiler/ast";
import { tokenize } from "../../src/compiler/lexer";
import { parse } from "../../src/compiler/parser";

const parseSource = (src: string) => parse(tokenize(src).tokens);

// Parses "int x = <src>;" and returns the initializer as prefix notation.
function expr(src: string): string {
  const { program, errors } = parseSource(`int x = ${src};`);
  expect(errors).toEqual([]);
  const stmt = program.body[0];
  if (stmt.kind !== "VariableDeclaration" || !stmt.initializer) {
    throw new Error("expected a declaration with an initializer");
  }
  return formatExpression(stmt.initializer);
}

describe("parser: statements", () => {
  it("parses a declaration with an initializer", () => {
    const { program, errors } = parseSource("int age = 20;");
    expect(errors).toEqual([]);
    expect(program.body[0]).toMatchObject({
      kind: "VariableDeclaration",
      varType: "int",
      name: "age",
      initializer: { kind: "Literal", valueType: "int", value: 20 },
    });
  });

  it("parses a declaration without an initializer", () => {
    const { program, errors } = parseSource("float tax;");
    expect(errors).toEqual([]);
    expect(program.body[0]).toMatchObject({ varType: "float", name: "tax", initializer: null });
  });

  it("parses an assignment", () => {
    const { program, errors } = parseSource("age = age + 1;");
    expect(errors).toEqual([]);
    expect(program.body[0]).toMatchObject({ kind: "Assignment", name: "age" });
  });

  it("parses a print statement", () => {
    const { program, errors } = parseSource("print(age);");
    expect(errors).toEqual([]);
    expect(program.body[0]).toMatchObject({
      kind: "PrintStatement",
      expression: { kind: "Identifier", name: "age" },
    });
  });

  it("parses all four types", () => {
    const { program, errors } = parseSource("int a; float b; string c; bool d;");
    expect(errors).toEqual([]);
    expect(program.body.map((s) => (s.kind === "VariableDeclaration" ? s.varType : null))).toEqual([
      "int", "float", "string", "bool",
    ]);
  });

  it("parses an empty program", () => {
    const { program, errors } = parseSource("");
    expect(program.body).toEqual([]);
    expect(errors).toEqual([]);
  });

  it("records statement positions", () => {
    const { program } = parseSource("int a;\n  print(a);");
    expect(program.body[1]).toMatchObject({ kind: "PrintStatement", line: 2, column: 3 });
  });
});

describe("parser: expressions and precedence", () => {
  it("binds * tighter than +", () => {
    expect(expr("1 + 2 * 3")).toBe("(+ 1 (* 2 3))");
  });

  it("associates left to right", () => {
    expect(expr("10 - 3 - 2")).toBe("(- (- 10 3) 2)");
    expect(expr("8 / 4 / 2")).toBe("(/ (/ 8 4) 2)");
  });

  it("respects parentheses", () => {
    expect(expr("(1 + 2) * 3")).toBe("(* (group (+ 1 2)) 3)");
  });

  it("parses unary minus with higher precedence than *", () => {
    expect(expr("-a * b")).toBe("(* (- a) b)");
    expect(expr("--5")).toBe("(- (- 5))");
  });

  it("gives comparisons the lowest precedence", () => {
    expect(expr("a + 1 < b * 2")).toBe("(< (+ a 1) (* b 2))");
  });

  it("parses every literal type", () => {
    expect(expr("2.5")).toBe("2.5");
    expect(expr('"hi"')).toBe('"hi"');
    expect(expr("true")).toBe("true");
  });
});

describe("parser: errors", () => {
  it("reports a missing semicolon after the previous token and recovers", () => {
    const { program, errors } = parseSource("int x = 5\nprint(x);");
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      phase: "syntax",
      severity: "error",
      message: "Expected ';' after statement.",
      line: 1,
      column: 10,
    });
    expect(program.body).toHaveLength(1);
    expect(program.body[0].kind).toBe("PrintStatement");
  });

  it("reports a missing closing parenthesis", () => {
    const { errors } = parseSource("print(x;");
    expect(errors[0]).toMatchObject({
      message: "Expected ')' after expression.",
      line: 1,
      column: 8,
    });
  });

  it("reports a missing opening parenthesis after print", () => {
    const { errors } = parseSource("print x;");
    expect(errors[0]).toMatchObject({ message: "Expected '(' after 'print'.", column: 7 });
  });

  it("reports a missing expression", () => {
    const { errors } = parseSource("int x = ;");
    expect(errors[0]).toMatchObject({ message: "Expected expression.", line: 1, column: 9 });
  });

  it("reports a missing variable name", () => {
    const { errors } = parseSource("int 5;");
    expect(errors[0]).toMatchObject({ message: "Expected variable name after type.", column: 5 });
  });

  it("reports an unexpected token", () => {
    expect(parseSource(")").errors[0].message).toBe("Unexpected token ')'.");
  });

  it("reports an assignment without '='", () => {
    expect(parseSource("x 5;").errors[0].message).toBe("Unexpected token '5'.");
  });

  it("reports that if statements are not supported yet", () => {
    const { errors } = parseSource("if (x) { }");
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe("'if' statements are not supported yet.");
  });

  it("recovers and reports several errors in one run", () => {
    const { program, errors } = parseSource("int a = ;\nint b = ;\nprint(a);");
    expect(errors.map((e) => e.line)).toEqual([1, 2]);
    expect(program.body).toHaveLength(1);
  });

  it("does not crash on unfinished input", () => {
    const { errors } = parseSource("print(");
    expect(errors[0].message).toBe("Expected expression.");
  });

  it("rejects absurdly deep nesting instead of crashing", () => {
    const src = `print(${"(".repeat(500)}1${")".repeat(500)});`;
    const { errors } = parseSource(src);
    expect(errors[0].message).toBe("Expression is nested too deeply.");
  });

  it("accepts a token list with no EOF token", () => {
    const { program, errors } = parse([]);
    expect(program.body).toEqual([]);
    expect(errors).toEqual([]);
  });
});
