import { describe, expect, it } from "vitest";
import { MAX_SOURCE_LENGTH, compile } from "../../src/compiler";

const SPEC = "int a = 10;\nint b = 20;\nint result = a + b;\nprint(result);";
const statuses = (src: string) => compile(src).phases.map((p) => p.status);

describe("pipeline: successful compilation", () => {
  it("runs every phase on the specification example", () => {
    const result = compile(SPEC);
    expect(result.status).toBe("SUCCESS");
    expect(result.failedPhase).toBeNull();
    expect(result.errors).toEqual([]);
    expect(result.tokens?.length).toBeGreaterThan(0);
    expect(result.ast?.body).toHaveLength(4);
    expect(result.symbolTable?.map((s) => s.name)).toEqual(["a", "b", "result"]);
    expect(result.intermediateCode?.text.startsWith("t1 = 10")).toBe(true);
    expect(result.optimization?.text).toBe(
      ["a = 10", "", "b = 20", "", "result = 30", "", "print 30"].join("\n"),
    );
    expect(result.target?.text).toContain("STORE [result], #30");
    expect(result.target?.note).toContain("not executable");
  });

  it("reports every phase as successful, in pipeline order", () => {
    const result = compile(SPEC);
    expect(result.phases.map((p) => p.phase)).toEqual([
      "lexical", "syntax", "semantic", "intermediate", "optimization", "codegen",
    ]);
    expect(result.phases.every((p) => p.status === "success")).toBe(true);
  });

  it("compiles an empty program", () => {
    const result = compile("");
    expect(result.status).toBe("SUCCESS");
    expect(result.intermediateCode?.text).toBe("");
    expect(result.target?.instructions).toEqual([]);
  });

  it("does not fail because of warnings", () => {
    const result = compile("int x;\nprint(x);");
    expect(result.status).toBe("SUCCESS");
    expect(result.warnings).toHaveLength(1);
    expect(result.phases[2]).toMatchObject({ phase: "semantic", status: "success", warnings: 1 });
  });
});

describe("pipeline: failures stop later phases", () => {
  it("stops at semantic errors and keeps the symbol table", () => {
    const src = 'int age = "hello";\n\nprint(unknown);';
    const result = compile(src);
    expect(result.status).toBe("FAILED");
    expect(result.failedPhase).toBe("semantic");
    expect(result.errors.map((e) => e.message)).toEqual([
      "Cannot assign STRING to INT.",
      "Undeclared variable 'unknown'.",
    ]);
    expect(statuses(src)).toEqual(["success", "success", "failed", "skipped", "skipped", "skipped"]);
    expect(result.ast).not.toBeNull();
    expect(result.symbolTable?.map((s) => s.name)).toEqual(["age"]);
    expect(result.intermediateCode).toBeNull();
    expect(result.optimization).toBeNull();
    expect(result.target).toBeNull();
  });

  it("stops at lexical errors and keeps the tokens", () => {
    const result = compile("int y = 3 $ 4;");
    expect(result.failedPhase).toBe("lexical");
    expect(result.errors[0]).toMatchObject({ phase: "lexical", message: "Invalid character '$'." });
    expect(result.tokens).not.toBeNull();
    expect(result.ast).toBeNull();
    expect(statuses("int y = 3 $ 4;")).toEqual([
      "failed", "skipped", "skipped", "skipped", "skipped", "skipped",
    ]);
  });

  it("stops at syntax errors and returns no AST", () => {
    const result = compile("int x = 5\nprint(x);");
    expect(result.failedPhase).toBe("syntax");
    expect(result.errors[0].message).toBe("Expected ';' after statement.");
    expect(result.tokens).not.toBeNull();
    expect(result.ast).toBeNull();
    expect(result.symbolTable).toBeNull();
    expect(result.phases[2].status).toBe("skipped");
  });

  it("counts errors per phase", () => {
    const result = compile('int age = "hello";\n\nprint(unknown);');
    expect(result.phases.map((p) => p.errors)).toEqual([0, 0, 2, 0, 0, 0]);
  });

  it("rejects source code that is too long", () => {
    const result = compile("a".repeat(MAX_SOURCE_LENGTH + 1));
    expect(result.status).toBe("FAILED");
    expect(result.failedPhase).toBe("lexical");
    expect(result.errors[0].message).toContain("too long");
    expect(result.tokens).toBeNull();
  });
});

describe("pipeline: stopAfter", () => {
  it("can stop after the lexical phase", () => {
    const result = compile(SPEC, { stopAfter: "lexical" });
    expect(result.status).toBe("SUCCESS");
    expect(result.tokens).not.toBeNull();
    expect(result.ast).toBeNull();
    expect(result.phases.map((p) => p.status)).toEqual([
      "success", "skipped", "skipped", "skipped", "skipped", "skipped",
    ]);
  });

  it("can stop after the semantic phase", () => {
    const result = compile(SPEC, { stopAfter: "semantic" });
    expect(result.status).toBe("SUCCESS");
    expect(result.symbolTable).not.toBeNull();
    expect(result.intermediateCode).toBeNull();
  });
});

describe("pipeline: robustness", () => {
  it("returns plain JSON data that survives serialization", () => {
    const result = compile(SPEC);
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });

  it("gives the same result for the same input", () => {
    expect(compile(SPEC)).toEqual(compile(SPEC));
  });

  it("never throws on strange input", () => {
    const inputs = [
      "$$$", '"', "(((((", "int", "int x =", "print(", "if", "\u0000", "💥",
      "x = ;;;", "}{", "3.", "/", "//", "\r\n\r\n",
      "print(" + "(".repeat(1000) + ");",
    ];
    for (const input of inputs) {
      const result = compile(input);
      expect(["SUCCESS", "FAILED"]).toContain(result.status);
    }
  });
});
