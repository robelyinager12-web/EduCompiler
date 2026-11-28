import { describe, expect, it } from "vitest";
import { compile } from "../../src/compiler";
import type { Operand, TacInstruction } from "../../src/compiler/intermediate";

type Value = number | string | boolean;

interface Trace {
  prints: Value[];
  vars: Record<string, Value>;
  trap: string | null;
}

const wrap = (type: string, v: number): number => (type === "int" ? v | 0 : v);

// A tiny reference machine for TAC. It exists only in tests, so the optimizer is
// checked against something it did not produce. int arithmetic wraps like 32-bit
// hardware, and division by zero stops the program ("trap").
function evaluate(instructions: TacInstruction[], variables: string[]): Trace {
  const env = new Map<string, Value>();
  const prints: Value[] = [];
  const read = (o: Operand): Value => (o.kind === "const" ? o.value : (env.get(o.name) ?? 0));
  const snapshot = (trap: string | null): Trace => ({
    prints,
    vars: Object.fromEntries(
      variables.filter((v) => env.has(v)).map((v) => [v, env.get(v) as Value]),
    ),
    trap,
  });
  const store = (name: string, value: Value) =>
    env.set(name, typeof value === "number" && value === 0 ? 0 : value); // no -0

  for (const i of instructions) {
    if (i.op === "copy") {
      store(i.dest, read(i.src));
      continue;
    }
    if (i.op === "print") {
      prints.push(read(i.operand));
      continue;
    }
    if (i.op === "unary") {
      store(i.dest, wrap(i.type, -(read(i.operand) as number)));
      continue;
    }

    const l = read(i.left);
    const r = read(i.right);
    const a = l as number;
    const b = r as number;
    let out: Value = 0;
    switch (i.operator) {
      case "+":
        out = typeof l === "string" ? l + String(r) : wrap(i.type, a + b);
        break;
      case "-":
        out = wrap(i.type, a - b);
        break;
      case "*":
        out = i.type === "int" ? Math.imul(a, b) : a * b;
        break;
      case "/":
        if (b === 0) return snapshot("division by zero");
        out = i.type === "int" ? Math.trunc(a / b) | 0 : a / b;
        break;
      case "==":
        out = l === r;
        break;
      case "!=":
        out = l !== r;
        break;
      case "<":
        out = a < b;
        break;
      case ">":
        out = a > b;
        break;
      case "<=":
        out = a <= b;
        break;
      case ">=":
        out = a >= b;
        break;
    }
    store(i.dest, out);
  }
  return snapshot(null);
}

function both(source: string) {
  const result = compile(source);
  expect(result.status, source).toBe("SUCCESS");
  const vars = (result.symbolTable ?? []).map((s) => s.name);
  return {
    before: evaluate(result.intermediateCode?.instructions ?? [], vars),
    after: evaluate(result.optimization?.instructions ?? [], vars),
  };
}

const CORPUS: [string, string, Value[]][] = [
  ["integer division truncates", "int i = 7 / 2;\nprint(i);", [3]],
  ["negative integer division truncates toward zero", "print(-7 / 2);", [-3]],
  ["float division", "float f = 7 / 2.0;\nprint(f);", [3.5]],
  ["string concatenation", 'string s = "a" + "b";\nprint(s);', ["ab"]],
  ["comparison", "bool b = 1 < 2;\nprint(b);", [true]],
  ["overwritten assignment", "int x = 1;\nx = 2;\nprint(x);", [2]],
  ["precedence and parentheses", "print(1 + 2 * 3);\nprint((1 + 2) * 3);", [7, 9]],
  ["int overflow wraps and is never folded", "int big = 2147483647;\nint w = big + 1;\nprint(w);", [-2147483648]],
  ["int widened to float", "float t = 2;\nprint(t);", [2]],
  ["values flow through variables", "int a = 5;\nint b = a * 2;\nint c = b - a;\nprint(c);", [5]],
];

describe("optimizer preserves behavior: fixed corpus", () => {
  it.each(CORPUS)("%s", (_name, source, expected) => {
    const { before, after } = both(source);
    expect(before.prints, "unoptimized").toEqual(expected);
    expect(after.prints, "optimized").toEqual(expected);
    expect(after.vars).toEqual(before.vars);
  });

  it("keeps a division whose zero divisor is only found by propagation", () => {
    const { before, after } = both("int z = 0;\nint y = 5 / z;\nprint(1);");
    expect(before.trap).toBe("division by zero");
    expect(after.trap).toBe("division by zero");
    expect(after.prints).toEqual([]);
  });

  it("keeps a trapping division even when its result is overwritten", () => {
    const { before, after } = both("int z = 0;\nint y = 5 / z;\ny = 1;\nprint(y);");
    expect(before.trap).toBe("division by zero");
    expect(after.trap).toBe("division by zero");
  });
});

// Seeded, so a failure can be reproduced from the seed in the message.
function random(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomProgram(seed: number): string {
  const next = random(seed);
  const pick = (n: number) => Math.floor(next() * n);
  const names = ["a", "b", "c", "d"];
  const declared: string[] = [];

  const expr = (depth: number): string => {
    const kind = pick(depth <= 0 ? 2 : 6);
    if (kind === 0) return String(pick(10));
    if (kind === 1) return declared.length > 0 ? declared[pick(declared.length)] : String(pick(10));
    if (kind === 2) return `-${expr(depth - 1)}`;
    if (kind === 3) return `(${expr(depth - 1)})`;
    return `${expr(depth - 1)} ${["+", "-", "*", "/"][pick(4)]} ${expr(depth - 1)}`;
  };

  const lines: string[] = [];
  const count = 3 + pick(8);
  for (let n = 0; n < count; n++) {
    const kind = pick(3);
    if (kind === 0 && declared.length < names.length) {
      const name = names[declared.length];
      lines.push(`int ${name} = ${expr(3)};`); // the initializer cannot use the new name
      declared.push(name);
    } else if (kind === 1 && declared.length > 0) {
      lines.push(`${declared[pick(declared.length)]} = ${expr(3)};`);
    } else {
      lines.push(`print(${expr(3)});`);
    }
  }
  return lines.join("\n");
}

describe("optimizer preserves behavior: random programs", () => {
  it("matches the unoptimized code for 300 generated programs", () => {
    let compiled = 0;

    for (let seed = 1; seed <= 300; seed++) {
      const source = randomProgram(seed);
      const label = `seed ${seed}:\n${source}`;
      const result = compile(source);

      if (result.status === "FAILED") {
        // The only legitimate rejection is a literal division by zero.
        expect(result.failedPhase, label).toBe("semantic");
        expect(result.errors.every((e) => e.message === "Division by zero."), label).toBe(true);
        continue;
      }

      compiled++;
      const vars = (result.symbolTable ?? []).map((s) => s.name);
      const before = evaluate(result.intermediateCode?.instructions ?? [], vars);
      const after = evaluate(result.optimization?.instructions ?? [], vars);

      expect(after.prints, label).toEqual(before.prints);
      expect(after.trap, label).toBe(before.trap);
      // After a trap the program stops, and removed dead stores may leave different
      // intermediate variable values. Final values are compared only for complete runs.
      if (before.trap === null) expect(after.vars, label).toEqual(before.vars);
    }

    expect(compiled).toBeGreaterThan(150);
  });
});
