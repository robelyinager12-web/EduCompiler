import { describe, expect, it } from "vitest";
import {
  INSTRUCTION_SET,
  formatTarget,
  generateTarget,
} from "../../src/compiler/code-generator";
import { generateTac } from "../../src/compiler/intermediate";
import type { TacInstruction } from "../../src/compiler/intermediate";
import { tokenize } from "../../src/compiler/lexer";
import { optimize } from "../../src/compiler/optimizer";
import { parse } from "../../src/compiler/parser";
import { analyze } from "../../src/compiler/semantic";
import type { SymbolEntry } from "../../src/compiler/symbol-table";

function build(src: string, optimized = false) {
  const lexed = tokenize(src);
  expect(lexed.errors).toEqual([]);
  const parsed = parse(lexed.tokens);
  expect(parsed.errors).toEqual([]);
  const semantic = analyze(parsed.program);
  expect(semantic.errors).toEqual([]);

  const tac = generateTac(parsed.program, semantic.symbolTable);
  const input = optimized ? optimize(tac, semantic.symbolTable).instructions : tac;
  const result = generateTarget(input, semantic.symbolTable);
  return { tac: input, ...result, text: formatTarget(result.instructions) };
}

const text = (src: string, optimized = false) => build(src, optimized).text;

const SPEC = "int a = 10;\nint b = 20;\nint result = a + b;\nprint(result);";

describe("target code: output text", () => {
  it("translates the unoptimized specification example", () => {
    expect(text(SPEC)).toBe(
      [
        "LOAD R1, #10",
        "STORE [a], R1",
        "",
        "LOAD R2, #20",
        "STORE [b], R2",
        "",
        "ADD R3, [a], [b]",
        "STORE [result], R3",
        "",
        "PRINT [result]",
      ].join("\n"),
    );
  });

  it("translates the optimized specification example", () => {
    expect(text(SPEC, true)).toBe(
      ["STORE [a], #10", "", "STORE [b], #20", "", "STORE [result], #30", "", "PRINT #30"].join("\n"),
    );
  });

  it("keeps operations on unknown values", () => {
    expect(text("int x;\nint y = x + 1;\nprint(y);", true)).toBe(
      ["ADD R1, [x], #1", "STORE [y], R1", "", "PRINT [y]"].join("\n"),
    );
  });

  it("uses floating-point opcodes for float results", () => {
    expect(text("float x;\nfloat y = x * 2.0;")).toBe(["FMUL R1, [x], #2.0", "STORE [y], R1"].join("\n"));
  });

  it("uses CONCAT for string addition", () => {
    expect(text('string s = "a" + "b";')).toBe(['CONCAT R1, #"a", #"b"', "STORE [s], R1"].join("\n"));
  });

  it("uses a compare opcode for comparisons", () => {
    expect(text("bool ok = 1 < 2;")).toBe(["CMPLT R1, #1, #2", "STORE [ok], R1"].join("\n"));
  });

  it("negates integers", () => {
    expect(text("int a = 1;\nint x = -a;")).toBe(
      ["LOAD R1, #1", "STORE [a], R1", "", "NEG R2, [a]", "STORE [x], R2"].join("\n"),
    );
  });

  it("negates floats", () => {
    expect(text("float f = 1.5;\nfloat g = -f;")).toBe(
      ["LOAD R1, #1.5", "STORE [f], R1", "", "FNEG R2, [f]", "STORE [g], R2"].join("\n"),
    );
  });

  it("copies a variable through a register", () => {
    expect(text("int a = 1;\nint b = a;")).toBe(
      ["LOAD R1, #1", "STORE [a], R1", "", "LOAD R2, [a]", "STORE [b], R2"].join("\n"),
    );
  });

  it("chooses DIV or FDIV from the result type", () => {
    expect(text("int a = 7;\nint b = a / 2;")).toContain("DIV R2, [a], #2");
    expect(text("int a = 7;\nint b = a / 2;")).not.toContain("FDIV");
    expect(text("int a = 7;\nfloat c = a / 2.0;")).toContain("FDIV R2, [a], #2.0");
  });

  it("generates nothing for a declaration without a value", () => {
    expect(build("float f;").instructions).toEqual([]);
    expect(text("float f;")).toBe("");
  });

  it("prints variables and constants directly, and expressions through a register", () => {
    expect(text('int a = 1;\nprint(a);\nprint(a + 1);\nprint("hi");')).toBe(
      [
        "LOAD R1, #1",
        "STORE [a], R1",
        "",
        "PRINT [a]",
        "",
        "ADD R2, [a], #1",
        "PRINT R2",
        "",
        'PRINT #"hi"',
      ].join("\n"),
    );
  });
});

describe("target code: data", () => {
  it("records opcode, operands, TAC index, statement and line", () => {
    const { instructions } = build(SPEC);
    expect(instructions[0]).toMatchObject({
      opcode: "LOAD",
      operands: ["R1", "#10"],
      tacIndex: 0,
      stmt: 0,
      line: 1,
    });
    expect(instructions[0].explanation.length).toBeGreaterThan(0);
  });

  it("maps every TAC instruction to its target lines", () => {
    const { mapping } = build(SPEC);
    expect(mapping).toHaveLength(7);
    expect(mapping[1]).toMatchObject({ tacIndex: 1, tac: "a = t1", target: ["STORE [a], R1"] });
    expect(mapping[4]).toMatchObject({
      tacIndex: 4,
      line: 3,
      tac: "t3 = a + b",
      target: ["ADD R3, [a], [b]"],
    });
  });

  it("counts the registers used", () => {
    expect(build(SPEC).registersUsed).toBe(3);
    expect(build(SPEC, true).registersUsed).toBe(0);
  });

  it("does not confuse a variable named t1 with a temporary", () => {
    expect(text("int t1 = 5;\nint x = t1 + 1;")).toBe(
      ["LOAD R1, #5", "STORE [t1], R1", "", "ADD R2, [t1], #1", "STORE [x], R2"].join("\n"),
    );
  });

  it("copies memory to memory through a scratch register", () => {
    const symbol = (name: string): SymbolEntry => ({
      name,
      type: "int",
      value: null,
      scope: "global",
      line: 1,
      initialized: true,
    });
    const tac: TacInstruction[] = [
      { op: "copy", stmt: 0, line: 1, dest: "b", src: { kind: "var", name: "a" }, type: "int" },
    ];
    const result = generateTarget(tac, [symbol("a"), symbol("b")]);
    expect(formatTarget(result.instructions)).toBe(["LOAD R1, [a]", "STORE [b], R1"].join("\n"));
    expect(result.mapping[0].target).toHaveLength(2);
  });

  it("handles an empty program", () => {
    const result = generateTarget([], []);
    expect(result.instructions).toEqual([]);
    expect(result.mapping).toEqual([]);
    expect(result.registersUsed).toBe(0);
  });

  it("describes every opcode it uses and states that the code is not executable", () => {
    const result = build(
      [
        "int a = 7;",
        "float f = 1.5;",
        'string s = "x" + "y";',
        "bool ok = a < 10;",
        "int n = -a;",
        "float g = -f;",
        "int q = a / 2;",
        "float r = f / 2.0;",
        "a = a - 1;",
        "print(a);",
      ].join("\n"),
    );
    const used = new Set<string>(result.instructions.map((i) => i.opcode));
    for (const opcode of ["LOAD", "STORE", "CONCAT", "CMPLT", "NEG", "FNEG", "DIV", "FDIV", "SUB", "PRINT"]) {
      expect(used.has(opcode)).toBe(true);
    }
    for (const instruction of result.instructions) {
      expect(INSTRUCTION_SET[instruction.opcode].length).toBeGreaterThan(0);
    }
    expect(result.note).toContain("not executable");
  });

  it("does not modify its input", () => {
    const parsed = parse(tokenize(SPEC).tokens);
    const semantic = analyze(parsed.program);
    const tac = generateTac(parsed.program, semantic.symbolTable);
    const snapshot = JSON.stringify(tac);
    generateTarget(tac, semantic.symbolTable);
    expect(JSON.stringify(tac)).toBe(snapshot);
  });
});
