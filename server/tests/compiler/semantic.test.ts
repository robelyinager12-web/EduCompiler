import { describe, expect, it } from "vitest";
import { tokenize } from "../../src/compiler/lexer";
import { parse } from "../../src/compiler/parser";
import { analyze } from "../../src/compiler/semantic";
import { SymbolTable } from "../../src/compiler/symbol-table";

// These tests are about semantics, so the source must be lexically and syntactically valid.
function run(src: string) {
  const lexed = tokenize(src);
  expect(lexed.errors).toEqual([]);
  const parsed = parse(lexed.tokens);
  expect(parsed.errors).toEqual([]);
  return analyze(parsed.program);
}

const messages = (src: string) => run(src).errors.map((e) => e.message);

describe("semantic: valid programs", () => {
  it("builds the symbol table with type, value, scope and line", () => {
    const { symbolTable, errors, warnings } = run(
      "int a = 10;\nint b = 20;\nint result = a + b;\nprint(result);",
    );
    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
    expect(symbolTable.map((s) => [s.name, s.type, s.value, s.scope, s.line])).toEqual([
      ["a", "int", 10, "global", 1],
      ["b", "int", 20, "global", 2],
      ["result", "int", null, "global", 3],
    ]);
  });

  it("allows int to be widened to float", () => {
    expect(messages("float tax = 2;")).toEqual([]);
  });

  it("allows string concatenation and valid comparisons", () => {
    const src = 'string s = "a" + "b";\nbool ok = 1 < 2;\nbool same = true == false;\nbool n = 1 == 2.5;';
    expect(messages(src)).toEqual([]);
  });

  it("types int / int as int and mixed arithmetic as float", () => {
    expect(messages("int x = 7 / 2;\nfloat y = 7 / 2.0;\nfloat z = 1 + 2.5;")).toEqual([]);
  });
});

describe("semantic: declarations and assignments", () => {
  it("reports the incompatible type and the undeclared variable from the specification", () => {
    expect(messages('int age = "hello";\n\nprint(unknown);')).toEqual([
      "Cannot assign STRING to INT.",
      "Undeclared variable 'unknown'.",
    ]);
  });

  it("reports a duplicate declaration and keeps one symbol", () => {
    const { errors, symbolTable } = run("int a = 1;\nint a = 2;");
    expect(errors[0]).toMatchObject({
      message: "Variable 'a' is already declared in this scope.",
      line: 2,
    });
    expect(symbolTable).toHaveLength(1);
  });

  it("does not allow float to be assigned to int", () => {
    expect(messages("int x = 2.5;")).toEqual(["Cannot assign FLOAT to INT."]);
  });

  it("does not allow int to be assigned to bool", () => {
    expect(messages("bool b = 1;")).toEqual(["Cannot assign INT to BOOL."]);
  });

  it("reports assignment to an undeclared variable at its position", () => {
    expect(run("y = 5;").errors[0]).toMatchObject({
      message: "Undeclared variable 'y'.",
      line: 1,
      column: 1,
    });
  });

  it("reports a type mismatch in an assignment", () => {
    expect(run('int a = 1;\na = "x";').errors[0]).toMatchObject({
      message: "Cannot assign STRING to INT.",
      line: 2,
    });
  });

  it("checks the initializer before declaring the name", () => {
    const { errors, symbolTable } = run("int x = x;");
    expect(errors.map((e) => e.message)).toEqual(["Undeclared variable 'x'."]);
    expect(symbolTable).toHaveLength(1);
  });

  it("does not cascade one error into several", () => {
    expect(messages("int x = y + 1;")).toEqual(["Undeclared variable 'y'."]);
  });
});

describe("semantic: operators", () => {
  it("rejects invalid binary operands and points at the operator", () => {
    const { errors } = run('int x = "a" - 1;');
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      message: "Operator '-' cannot be applied to STRING and INT.",
      line: 1,
      column: 13,
    });
  });

  it("rejects mixing string and int with +", () => {
    expect(messages('string s = "a" + 1;')).toEqual([
      "Operator '+' cannot be applied to STRING and INT.",
    ]);
  });

  it("rejects invalid comparisons", () => {
    expect(messages('bool a = 1 == "a";\nbool b = "a" < "b";')).toEqual([
      "Operator '==' cannot be applied to INT and STRING.",
      "Operator '<' cannot be applied to STRING and STRING.",
    ]);
  });

  it("gives comparisons the type bool", () => {
    expect(messages("int n = 1 < 2;")).toEqual(["Cannot assign BOOL to INT."]);
  });

  it("rejects unary minus on a string", () => {
    expect(messages('int x = -"a";\nint y = -5;')).toEqual([
      "Operator '-' cannot be applied to STRING.",
    ]);
  });

  it("types division with a float operand as float", () => {
    expect(messages("int y = 7 / 2.0;")).toEqual(["Cannot assign FLOAT to INT."]);
  });
});

describe("semantic: division by zero", () => {
  it("reports division by a constant zero", () => {
    const { errors } = run("int x = 1 / 0;\nfloat f = 1.0 / (0);\nint y = 4 / -0;");
    expect(errors.map((e) => e.message)).toEqual([
      "Division by zero.",
      "Division by zero.",
      "Division by zero.",
    ]);
    expect(errors[0]).toMatchObject({ line: 1, column: 11 });
  });

  it("does not report division by a variable", () => {
    expect(messages("int a = 0;\nint b = 1 / a;")).toEqual([]);
  });
});

describe("semantic: warnings", () => {
  it("warns when a variable is used before it is assigned", () => {
    const { errors, warnings } = run("int x;\nprint(x);");
    expect(errors).toEqual([]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatchObject({
      phase: "semantic",
      severity: "warning",
      message: "Variable 'x' is used before it is assigned.",
      line: 2,
      column: 7,
    });
  });

  it("does not warn after an assignment", () => {
    expect(run("int x;\nx = 1;\nprint(x);").warnings).toEqual([]);
  });
});

describe("semantic: symbol table details", () => {
  it("stores constant initial values and leaves others empty", () => {
    const { symbolTable } = run(
      'string name = "Student";\nint n = -5;\nbool ok = true;\nfloat f;\nint m = n + 1;',
    );
    expect(symbolTable.map((s) => s.value)).toEqual(["Student", -5, true, null, null]);
  });

  it("reports diagnostics in source order", () => {
    expect(run("y = z;").errors.map((e) => e.column)).toEqual([1, 5]);
  });

  it("supports nested scopes", () => {
    const table = new SymbolTable();
    const entry = { name: "a", type: "int" as const, value: 1, line: 1, initialized: true };

    expect(table.declare(entry)).toBe(true);
    expect(table.declare(entry)).toBe(false);

    table.enterScope("inner");
    expect(table.declare({ ...entry, type: "string", value: "x", line: 2 })).toBe(true);
    expect(table.lookup("a")?.type).toBe("string");

    table.exitScope();
    expect(table.lookup("a")?.type).toBe("int");
    expect(table.entries().map((e) => e.scope)).toEqual(["global", "inner"]);
  });
});
