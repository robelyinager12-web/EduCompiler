import { describe, expect, it } from "vitest";
import { formatTac, generateTac } from "../../src/compiler/intermediate";
import { tokenize } from "../../src/compiler/lexer";
import { optimize } from "../../src/compiler/optimizer";
import { parse } from "../../src/compiler/parser";
import { analyze } from "../../src/compiler/semantic";

function run(src: string) {
  const lexed = tokenize(src);
  expect(lexed.errors).toEqual([]);
  const parsed = parse(lexed.tokens);
  expect(parsed.errors).toEqual([]);
  const semantic = analyze(parsed.program);
  expect(semantic.errors).toEqual([]);

  const tac = generateTac(parsed.program, semantic.symbolTable);
  const result = optimize(tac, semantic.symbolTable);
  return { tac, ...result, before: formatTac(tac), after: formatTac(result.instructions) };
}

const SPEC = "int a = 10;\nint b = 20;\nint result = a + b;\nprint(result);";

describe("optimizer: the specification example", () => {
  it("folds and propagates the constants", () => {
    expect(run(SPEC).after).toBe(
      ["a = 10", "", "b = 20", "", "result = 30", "", "print 30"].join("\n"),
    );
  });

  it("reports statistics", () => {
    expect(run(SPEC).stats).toEqual({
      instructionsBefore: 7,
      instructionsAfter: 4,
      propagations: 5,
      foldings: 1,
      eliminations: 3,
    });
  });

  it("explains each step", () => {
    const folding = run(SPEC).steps.find((s) => s.kind === "constant-folding");
    expect(folding).toMatchObject({
      before: "t3 = 10 + 20",
      after: "t3 = 30",
      line: 3,
    });
    expect(folding?.explanation).toContain("compile time");
  });
});

describe("optimizer: constant folding", () => {
  it("folds arithmetic and respects precedence", () => {
    expect(run("int x = 1 + 2 * 3;").after).toBe("x = 7");
  });

  it("uses integer division truncated toward zero for int", () => {
    expect(run("int x = 7 / 2;\nint y = -7 / 2;").after).toBe(["x = 3", "", "y = -3"].join("\n"));
  });

  it("uses real division when a float is involved", () => {
    expect(run("float f = 7 / 2.0;").after).toBe("f = 3.5");
  });

  it("folds string concatenation", () => {
    expect(run('string s = "a" + "b";\nprint(s);').after).toBe(
      ['s = "ab"', "", 'print "ab"'].join("\n"),
    );
  });

  it("folds comparisons", () => {
    expect(run("bool a = 1 < 2;\nbool b = 1 == 1.0;").after).toBe(
      ["a = true", "", "b = true"].join("\n"),
    );
  });

  it("folds unary minus", () => {
    expect(run("int a = -5;").after).toBe("a = -5");
  });

  it("shows int to float widening", () => {
    expect(run("float tax = 2;").after).toBe("tax = 2.0");
  });
});

describe("optimizer: safety", () => {
  it("does not fold a division by zero found through propagation", () => {
    const { after, steps } = run("int z = 0;\nint y = 1 / z;\nprint(y);");
    expect(after).toContain("1 / 0");
    expect(steps.filter((s) => s.kind === "constant-folding")).toEqual([]);
  });

  it("does not fold integer overflow", () => {
    const { after, steps } = run("int big = 2147483647 + 1;");
    expect(after).toContain("2147483647 + 1");
    expect(steps.filter((s) => s.kind === "constant-folding")).toEqual([]);
  });

  it("leaves code it cannot simplify unchanged", () => {
    const { before, after, steps } = run("int x;\nint y = x + 1;\nprint(y);");
    expect(after).toBe(before);
    expect(steps).toEqual([]);
  });

  it("does not modify its input", () => {
    const parsed = parse(tokenize(SPEC).tokens);
    const semantic = analyze(parsed.program);
    const tac = generateTac(parsed.program, semantic.symbolTable);
    const snapshot = JSON.stringify(tac);
    optimize(tac, semantic.symbolTable);
    expect(JSON.stringify(tac)).toBe(snapshot);
  });

  it("never confuses temporaries with a variable named t1", () => {
    const { before, after } = run("int t1 = 5;\nint x = t1 + 1;");
    expect(before).toBe(["t2 = 5", "t1 = t2", "", "t3 = t1 + 1", "x = t3"].join("\n"));
    expect(after).toBe(["t1 = 5", "", "x = 6"].join("\n"));
  });
});

describe("optimizer: constant propagation", () => {
  it("propagates through variables", () => {
    expect(run("int a = 5;\nint b = a * 2;\nprint(b);").after).toBe(
      ["a = 5", "", "b = 10", "", "print 10"].join("\n"),
    );
  });

  it("stops propagating a variable once it gets an unknown value", () => {
    const { after } = run("int x;\nint a = 1;\na = x + 1;\nprint(a);");
    expect(after).toBe(["t2 = x + 1", "a = t2", "", "print a"].join("\n"));
  });
});

describe("optimizer: dead code elimination", () => {
  it("removes an assignment that is overwritten before use", () => {
    const { after, steps } = run("int x = 1;\nx = 2;\nprint(x);");
    expect(after).toBe(["x = 2", "", "print 2"].join("\n"));
    expect(steps.some((s) => s.explanation.includes("assigned again"))).toBe(true);
  });

  it("keeps the final value of every variable", () => {
    expect(run("int a = 1;").after).toBe("a = 1");
  });

  it("handles an empty program", () => {
    const result = optimize([], []);
    expect(result.instructions).toEqual([]);
    expect(result.steps).toEqual([]);
    expect(result.stats.instructionsAfter).toBe(0);
  });
});
