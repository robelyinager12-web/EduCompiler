import { describe, expect, it } from "vitest";
import { compile } from "../../src/compiler";
import { CONCEPTS, CONCEPT_KEYS, checkSubmission } from "../../src/services/exerciseChecker";
import { exercises } from "../../prisma/seedData";

// The starter defaults to "" so the "unchanged starter" rule does not interfere.
const check = (concept: string, source: string, starter = "") =>
  checkSubmission(concept, source, starter, compile(source));

describe("exercise checker: concepts", () => {
  it.each([
    ["compiles", "int a = 1;\nprint(a);", 'int a = "x";'],
    ["error:lexical", "int a = 1 $ 2;", "int a = 1;"],
    ["error:syntax", "int a = 1", "int a = 1;"],
    ["error:semantic", "print(x);", "int a = 1;"],
    ["error:undeclared-variable", "print(x);", 'int a = "s";'],
    ["error:duplicate-declaration", "int a = 1;\nint a = 2;", "int a = 1;"],
    ["error:type-mismatch", 'int a = "s";', "print(x);"],
    ["error:division-by-zero", "int a = 1 / 0;", "int a = 1;"],
    ["warning:uninitialized", "int x;\nprint(x);", "int x = 1;\nprint(x);"],
    ["optimizes:constant-folding", "int a = 1 + 2;", "int a = 1;"],
    ["optimizes:dead-code-elimination", "int x = 1;\nx = 2;\nprint(x);", "int a = 1;"],
  ])("%s: accepts a matching program and rejects a non-matching one", (concept, good, bad) => {
    expect(check(concept, good)?.passed).toBe(true);
    expect(check(concept, bad)?.passed).toBe(false);
  });

  it("defines a key, label and expectation for every concept", () => {
    expect(CONCEPT_KEYS).toHaveLength(CONCEPTS.length);
    expect(new Set(CONCEPT_KEYS).size).toBe(CONCEPT_KEYS.length);
    for (const c of CONCEPTS) {
      expect(c.label.length).toBeGreaterThan(0);
      expect(c.expectation.length).toBeGreaterThan(0);
    }
  });
});

describe("exercise checker: feedback and rules", () => {
  it("rejects the unchanged starter code", () => {
    const source = "int a = 1;";
    const result = checkSubmission("compiles", source, source, compile(source));
    expect(result).toEqual({ passed: false, feedback: "Change the starter code before you submit." });
  });

  it("ignores whitespace differences when comparing with the starter", () => {
    const result = checkSubmission("compiles", "int a = 1;\n\n", "int a = 1;", compile("int a = 1;"));
    expect(result?.passed).toBe(false);
  });

  it("explains what failed and where", () => {
    const result = check("compiles", 'int a = "x";');
    expect(result?.passed).toBe(false);
    expect(result?.feedback).toContain("should compile without errors");
    expect(result?.feedback).toContain("semantic phase");
    expect(result?.feedback).toContain("Cannot assign STRING to INT.");
  });

  it("does not count a lexical failure as a semantic error", () => {
    expect(check("error:semantic", "int a = 1 $ 2;")?.passed).toBe(false);
  });

  it("does not count removal of temporaries as dead code", () => {
    expect(check("optimizes:dead-code-elimination", "int a = 1;")?.passed).toBe(false);
  });

  it("returns null for an unknown concept", () => {
    expect(check("type mismatch", "int a = 1;")).toBeNull();
    expect(check("constructor", "int a = 1;")).toBeNull();
  });
});

describe.each(exercises)("seed exercise: $title", (exercise) => {
  it("uses a known concept", () => {
    expect(CONCEPT_KEYS).toContain(exercise.expectedConcept);
  });

  it("is not solved by its own starter code", () => {
    const result = checkSubmission(
      exercise.expectedConcept,
      exercise.starterCode,
      exercise.starterCode,
      compile(exercise.starterCode),
    );
    expect(result?.passed).toBe(false);
  });

  it("is solved by its reference solution", () => {
    const result = checkSubmission(
      exercise.expectedConcept,
      exercise.solution,
      exercise.starterCode,
      compile(exercise.solution),
    );
    expect(result?.passed).toBe(true);
  });
});
