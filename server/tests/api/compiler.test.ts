import request from "supertest";
import { describe, expect, it, vi } from "vitest";

// The compiler routes never touch the database, but the app imports Prisma.
vi.mock("../../src/config/prisma", () => ({ prisma: {} }));

import app from "../../src/app";

const SPEC = "int a = 10;\nint b = 20;\nint result = a + b;\nprint(result);";
const post = (path: string, body: unknown) => request(app).post(path).send(body as object);

describe("POST /api/compiler/compile", () => {
  it("compiles a valid program through every phase", async () => {
    const res = await post("/api/compiler/compile", { source: SPEC });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("SUCCESS");
    expect(res.body.data.target.text).toContain("STORE [result], #30");
  });

  it("returns 200 with FAILED and diagnostics for student mistakes", async () => {
    const res = await post("/api/compiler/compile", {
      source: 'int age = "hello";\n\nprint(unknown);',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("FAILED");
    expect(res.body.data.failedPhase).toBe("semantic");
    expect(res.body.data.errors.map((e: { message: string }) => e.message)).toEqual([
      "Cannot assign STRING to INT.",
      "Undeclared variable 'unknown'.",
    ]);
  });

  it("reports source that is too long as a diagnostic, not an HTTP error", async () => {
    const res = await post("/api/compiler/compile", { source: "a".repeat(20001) });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("FAILED");
    expect(res.body.data.errors[0].message).toContain("too long");
  });
});

describe("compiler stage endpoints", () => {
  it("/lexical returns tokens only", async () => {
    const res = await post("/api/compiler/lexical", { source: SPEC });
    expect(res.status).toBe(200);
    expect(res.body.data.tokens.length).toBeGreaterThan(0);
    expect(res.body.data.ast).toBeNull();
  });

  it("/syntax returns the AST but no symbol table", async () => {
    const res = await post("/api/compiler/syntax", { source: SPEC });
    expect(res.body.data.ast.body).toHaveLength(4);
    expect(res.body.data.symbolTable).toBeNull();
  });

  it("/semantic returns the symbol table but no intermediate code", async () => {
    const res = await post("/api/compiler/semantic", { source: SPEC });
    expect(res.body.data.symbolTable).toHaveLength(3);
    expect(res.body.data.intermediateCode).toBeNull();
  });
});

describe("compiler request validation", () => {
  it("rejects a body without source", async () => {
    const res = await post("/api/compiler/compile", {});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects a source that is not a string", async () => {
    const res = await post("/api/compiler/compile", { source: 42 });
    expect(res.status).toBe(400);
  });

  it("rejects a request with no body at all", async () => {
    const res = await request(app).post("/api/compiler/compile");
    expect(res.status).toBe(400);
  });

  it("rejects malformed JSON with 400, not 500", async () => {
    const res = await request(app)
      .post("/api/compiler/compile")
      .set("Content-Type", "application/json")
      .send('{"source": ');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Request body is not valid JSON.");
  });

  it("rejects a body over the size limit with 413", async () => {
    const res = await post("/api/compiler/compile", { source: "a".repeat(200000) });
    expect(res.status).toBe(413);
    expect(res.body.success).toBe(false);
  });
});
