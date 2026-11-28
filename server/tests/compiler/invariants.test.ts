import { describe, expect, it } from "vitest";
import { MAX_SOURCE_LENGTH, compile } from "../../src/compiler";

const ORDER = ["lexical", "syntax", "semantic", "intermediate", "optimization", "codegen"];

// Rules that must hold for ANY input, valid or not.
function check(source: string) {
  const result = compile(source);
  const label = JSON.stringify(source).slice(0, 200);

  expect(result.phases.map((p) => p.phase), label).toEqual(ORDER);

  if (result.status === "SUCCESS") {
    expect(result.failedPhase, label).toBeNull();
    expect(result.errors, label).toEqual([]);
    expect(result.phases.every((p) => p.status === "success"), label).toBe(true);
    for (const output of [
      result.tokens,
      result.ast,
      result.symbolTable,
      result.intermediateCode,
      result.optimization,
      result.target,
    ]) {
      expect(output, label).not.toBeNull();
    }
  } else {
    const index = ORDER.indexOf(result.failedPhase ?? "");
    expect(index, label).toBeGreaterThanOrEqual(0);
    expect(result.errors.length, label).toBeGreaterThan(0);
    result.phases.forEach((p, i) => {
      expect(p.status, label).toBe(i < index ? "success" : i === index ? "failed" : "skipped");
    });
    if (index <= 1) {
      expect(result.symbolTable, label).toBeNull();
    }
    if (index === 1) expect(result.ast, label).toBeNull();
    if (index <= 2) {
      expect(result.intermediateCode, label).toBeNull();
      expect(result.optimization, label).toBeNull();
      expect(result.target, label).toBeNull();
    }
  }

  for (const d of [...result.errors, ...result.warnings]) {
    expect(d.line, label).toBeGreaterThanOrEqual(1);
    expect(d.column, label).toBeGreaterThanOrEqual(1);
  }

  expect(JSON.parse(JSON.stringify(result)), label).toEqual(result);
  return result;
}

const PIECES = [
  "int", "float", "string", "bool", "print", "if", "else", "true", "false",
  "x", "y", "a1", "0", "42", "3.14", '"s"', '"unterminated', "=", "==", "!=",
  "<", ">", "<=", ">=", "+", "-", "*", "/", "(", ")", "{", "}", ";", ";", "$",
  "@", "\n", "//c\n",
];

function tokenSoup(seed: number): string {
  let a = seed >>> 0;
  const next = () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };
  const length = 1 + Math.floor(next() * 40);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += PIECES[Math.floor(next() * PIECES.length)] + (next() < 0.8 ? " " : "");
  }
  return out;
}

describe("pipeline invariants", () => {
  it("holds for 500 random token sequences", () => {
    for (let seed = 1; seed <= 500; seed++) check(tokenSoup(seed));
  });

  it("is deterministic", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const source = tokenSoup(seed);
      expect(compile(source)).toEqual(compile(source));
    }
  });

  it("holds for valid programs, with and without warnings", () => {
    expect(check("int a = 1;\nprint(a);").status).toBe("SUCCESS");
    expect(check("int x;\nprint(x);").warnings).toHaveLength(1);
    expect(check("").status).toBe("SUCCESS");
  });
});

describe("size and depth limits", () => {
  it("rejects a very long operator chain instead of crashing", () => {
    const result = check(`print(${"1+".repeat(9000)}1);`);
    expect(result.failedPhase).toBe("syntax");
    expect(result.errors[0].message).toBe("Expression is nested too deeply.");
  });

  it("accepts a reasonably long chain", () => {
    expect(check(`print(${"1+".repeat(100)}1);`).status).toBe("SUCCESS");
  });

  it("rejects a very long unary chain", () => {
    expect(check(`print(${"-".repeat(1000)}1);`).failedPhase).toBe("syntax");
  });

  it("compiles a program near the size limit quickly", () => {
    const source = Array.from({ length: 1000 }, (_, i) => `int v${i} = ${i};`).join("\n");
    expect(source.length).toBeLessThan(MAX_SOURCE_LENGTH);

    const started = performance.now();
    const result = compile(source);
    expect(result.status).toBe("SUCCESS");
    expect(performance.now() - started).toBeLessThan(5000);
  });
});
