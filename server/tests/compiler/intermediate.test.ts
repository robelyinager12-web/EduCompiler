import { describe, expect, it } from "vitest";
import { formatTac, generateTac } from "../../src/compiler/intermediate";
import { tokenize } from "../../src/compiler/lexer";
import { parse } from "../../src/compiler/parser";
import { analyze } from "../../src/compiler/semantic";

function generate(src: string) {
  const lexed = tokenize(src);
  expect(lexed.errors).toEqual([]);
  const parsed = parse(lexed.tokens);
  expect(parsed.errors).toEqual([]);
  const semantic = analyze(parsed.program);
  expect(semantic.errors).toEqual([]);
  return { instructions: generateTac(parsed.program, semantic.symbolTable), parsed, semantic };
}

const tac = (src: string) => formatTac(generate(src).instructions);

describe("TAC: output text", () => {
  it("matches the example from the specification", () => {
    const text = tac("int a = 10;\nint b = 20;\nint result = a + b;\nprint(result);");
    expect(text).toBe(
      [
        "t1 = 10",
        "a = t1",
        "",
        "t2 = 20",
        "b = t2",
        "",
        "t3 = a + b",
        "result = t3",
        "",
        "print result",
      ].join("\n"),
    );
  });

  it("follows operator precedence", () => {
    expect(tac("int a = 1;\nint b = 2;\nint x = a + b * 2;")).toBe(
      [
        "t1 = 1",
        "a = t1",
        "",
        "t2 = 2",
        "b = t2",
        "",
        "t3 = b * 2",
        "t4 = a + t3",
        "x = t4",
      ].join("\n"),
    );
  });

  it("evaluates parentheses first", () => {
    expect(tac("int a = 1;\nint x = (a + 2) * 3;")).toBe(
      ["t1 = 1", "a = t1", "", "t2 = a + 2", "t3 = t2 * 3", "x = t3"].join("\n"),
    );
  });

  it("generates unary minus", () => {
    expect(tac("int a = 1;\nint x = -a;")).toBe(
      ["t1 = 1", "a = t1", "", "t2 = -a", "x = t2"].join("\n"),
    );
  });

  it("generates assignments", () => {
    expect(tac("int a = 1;\na = a + 1;")).toBe(
      ["t1 = 1", "a = t1", "", "t2 = a + 1", "a = t2"].join("\n"),
    );
  });

  it("prints variables and constants directly, and expressions through a temp", () => {
    expect(tac('int a = 1;\nprint(a);\nprint(a + 1);\nprint("hi");')).toBe(
      ["t1 = 1", "a = t1", "", "print a", "", "t2 = a + 1", "print t2", "", 'print "hi"'].join("\n"),
    );
  });

  it("generates comparisons", () => {
    expect(tac("bool ok = 1 < 2;")).toBe(["t1 = 1 < 2", "ok = t1"].join("\n"));
  });

  it("shows float constants with a decimal point", () => {
    expect(tac("float tax = 2.0;")).toBe(["t1 = 2.0", "tax = t1"].join("\n"));
  });

  it("generates nothing for a declaration without a value", () => {
    expect(generate("float f;").instructions).toEqual([]);
    expect(tac("float f;")).toBe("");
  });
});

describe("TAC: instruction data", () => {
  it("records value types, including int to float widening", () => {
    const { instructions } = generate("float tax = 2;");
    expect(instructions[0]).toMatchObject({ op: "copy", dest: "t1", type: "int" });
    expect(instructions[1]).toMatchObject({ op: "copy", dest: "tax", type: "float" });
  });

  it("records the result type of division", () => {
    const ints = generate("int a = 7;\nint b = a / 2;").instructions;
    expect(ints.find((i) => i.op === "binary")).toMatchObject({ operator: "/", type: "int" });

    const floats = generate("int a = 7;\nfloat c = a / 2.0;").instructions;
    expect(floats.find((i) => i.op === "binary")).toMatchObject({ operator: "/", type: "float" });
  });

  it("records source line and statement number", () => {
    const { instructions } = generate("int a = 1;\nprint(a);");
    expect(instructions[0]).toMatchObject({ stmt: 0, line: 1 });
    expect(instructions[2]).toMatchObject({ op: "print", stmt: 1, line: 2 });
  });

  it("starts temp numbering at t1 for every run", () => {
    const src = "int a = 1 + 2;";
    expect(tac(src)).toBe(tac(src));
    expect(tac(src).startsWith("t1 = 1 + 2")).toBe(true);
  });

  it("refuses a program that was not semantically valid", () => {
    const parsed = parse(tokenize("x = 1;").tokens);
    expect(() => generateTac(parsed.program, [])).toThrow("Internal error");
  });
});
