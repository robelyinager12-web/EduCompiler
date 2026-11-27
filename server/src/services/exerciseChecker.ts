import type { CompileResult } from "../compiler";

export interface ConceptDef {
  key: string;
  label: string;
  expectation: string; // shown to students when they miss
  test: (result: CompileResult) => boolean;
}

const ok = (r: CompileResult) => r.status === "SUCCESS";
const failedAt = (phase: string) => (r: CompileResult) => r.failedPhase === phase;
const semanticError = (match: (message: string) => boolean) => (r: CompileResult) =>
  r.failedPhase === "semantic" && r.errors.some((e) => match(e.message));
const hasStep = (kind: string, extra?: (explanation: string) => boolean) => (r: CompileResult) =>
  ok(r) &&
  (r.optimization?.steps ?? []).some((s) => s.kind === kind && (!extra || extra(s.explanation)));

export const CONCEPTS: ConceptDef[] = [
  {
    key: "compiles",
    label: "Program compiles without errors",
    expectation: "The program should compile without errors.",
    test: ok,
  },
  {
    key: "error:lexical",
    label: "Fails in the lexical phase",
    expectation: "The program should fail in the lexical phase.",
    test: failedAt("lexical"),
  },
  {
    key: "error:syntax",
    label: "Fails in the syntax phase",
    expectation: "The program should fail in the syntax phase.",
    test: failedAt("syntax"),
  },
  {
    key: "error:semantic",
    label: "Fails in the semantic phase",
    expectation: "The program should fail in the semantic phase.",
    test: failedAt("semantic"),
  },
  {
    key: "error:undeclared-variable",
    label: "Semantic error: undeclared variable",
    expectation: "The program should use a variable that was never declared.",
    test: semanticError((m) => m.startsWith("Undeclared variable")),
  },
  {
    key: "error:duplicate-declaration",
    label: "Semantic error: duplicate declaration",
    expectation: "The program should declare the same variable twice.",
    test: semanticError((m) => m.includes("is already declared")),
  },
  {
    key: "error:type-mismatch",
    label: "Semantic error: incompatible assignment",
    expectation: "The program should assign a value of an incompatible type.",
    test: semanticError((m) => m.startsWith("Cannot assign")),
  },
  {
    key: "error:division-by-zero",
    label: "Semantic error: division by zero",
    expectation: "The program should divide by the constant zero.",
    test: semanticError((m) => m === "Division by zero."),
  },
  {
    key: "warning:uninitialized",
    label: "Warning: variable used before assignment",
    expectation: "The program should compile but use a variable before it is assigned.",
    test: (r) => ok(r) && r.warnings.some((w) => w.message.includes("used before it is assigned")),
  },
  {
    key: "optimizes:constant-folding",
    label: "Optimizer folds a constant expression",
    expectation: "The program should compile and contain an expression the optimizer can fold.",
    test: hasStep("constant-folding"),
  },
  {
    key: "optimizes:dead-code-elimination",
    label: "Optimizer removes an overwritten assignment",
    expectation:
      "The program should compile and assign a variable twice so the first value is never used.",
    // "assigned again" is the explanation the optimizer writes for overwritten variables.
    // Temporaries are also removed in almost every program, so they do not count.
    test: hasStep("dead-code-elimination", (text) => text.includes("assigned again")),
  },
];

const byKey = new Map(CONCEPTS.map((c) => [c.key, c]));

export const CONCEPT_KEYS = CONCEPTS.map((c) => c.key) as [string, ...string[]];

export interface CheckResult {
  passed: boolean;
  feedback: string;
}

function describeOutcome(result: CompileResult): string {
  if (result.status === "SUCCESS") {
    const n = result.warnings.length;
    return `Your program compiled${n > 0 ? ` with ${n} warning${n === 1 ? "" : "s"}` : ""}.`;
  }
  const first = result.errors[0];
  const where = first ? ` (line ${first.line}: ${first.message})` : "";
  return `Your program failed in the ${result.failedPhase} phase${where}.`;
}

// Returns null when the concept is unknown, so the caller can store "no automatic check".
export function checkSubmission(
  concept: string,
  sourceCode: string,
  starterCode: string,
  result: CompileResult,
): CheckResult | null {
  const def = byKey.get(concept);
  if (!def) return null;

  if (sourceCode.trim() === starterCode.trim()) {
    return { passed: false, feedback: "Change the starter code before you submit." };
  }
  if (def.test(result)) {
    return { passed: true, feedback: `Correct. ${def.label}.` };
  }
  return { passed: false, feedback: `${def.expectation} ${describeOutcome(result)}` };
}
