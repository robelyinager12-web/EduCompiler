import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  program: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  compilationRun: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    deleteMany: vi.fn(),
  },
  exercise: { findUnique: vi.fn() },
  exerciseSubmission: { create: vi.fn() },
}));
vi.mock("../../src/config/prisma", () => ({ prisma: db }));

import app from "../../src/app";
import { signToken } from "../../src/utils/jwt";

const SPEC = "int a = 10;\nprint(a);";

function asUser(id = "u1") {
  db.user.findUnique.mockResolvedValue({
    id,
    name: "Abel",
    email: "abel@example.com",
    role: "STUDENT",
  });
  return { Authorization: `Bearer ${signToken(id)}` };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("programs", () => {
  it("requires login", async () => {
    const res = await request(app).get("/api/programs");
    expect(res.status).toBe(401);
  });

  it("lists only the caller's programs", async () => {
    db.program.findMany.mockResolvedValue([{ id: "p1", title: "First" }]);
    const res = await request(app).get("/api/programs").set(asUser());
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(db.program.findMany.mock.calls[0][0].where).toEqual({ userId: "u1" });
  });

  it("creates a program for the caller and ignores a userId in the body", async () => {
    db.program.count.mockResolvedValue(0);
    db.program.create.mockResolvedValue({ id: "p1", title: "T" });
    const res = await request(app)
      .post("/api/programs")
      .set(asUser())
      .send({ title: "T", sourceCode: "int a = 1;", userId: "u2" });
    expect(res.status).toBe(201);
    expect(db.program.create.mock.calls[0][0].data).toEqual({
      title: "T",
      sourceCode: "int a = 1;",
      userId: "u1",
    });
  });

  it("rejects an empty title", async () => {
    const res = await request(app)
      .post("/api/programs")
      .set(asUser())
      .send({ title: "  ", sourceCode: "" });
    expect(res.status).toBe(400);
    expect(db.program.create).not.toHaveBeenCalled();
  });

  it("enforces the limit of 100 saved programs", async () => {
    db.program.count.mockResolvedValue(100);
    const res = await request(app)
      .post("/api/programs")
      .set(asUser())
      .send({ title: "T", sourceCode: "" });
    expect(res.status).toBe(400);
    expect(db.program.create).not.toHaveBeenCalled();
  });

  it("returns 404 for a program the caller does not own", async () => {
    db.program.findFirst.mockResolvedValue(null);
    const res = await request(app).get("/api/programs/p1").set(asUser());
    expect(res.status).toBe(404);
    expect(db.program.findFirst.mock.calls[0][0].where).toEqual({ id: "p1", userId: "u1" });
  });

  it("updates an owned program", async () => {
    db.program.findFirst.mockResolvedValue({ id: "p1" });
    db.program.update.mockResolvedValue({ id: "p1", title: "New" });
    const res = await request(app)
      .put("/api/programs/p1")
      .set(asUser())
      .send({ title: "New", sourceCode: "int b = 2;" });
    expect(res.status).toBe(200);
    expect(db.program.update.mock.calls[0][0].where).toEqual({ id: "p1" });
  });

  it("deletes an owned program", async () => {
    db.program.findFirst.mockResolvedValue({ id: "p1" });
    db.program.delete.mockResolvedValue({});
    const res = await request(app).delete("/api/programs/p1").set(asUser());
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ id: "p1" });
  });
});

describe("compile and history", () => {
  it("compiles for an anonymous visitor without saving anything", async () => {
    const res = await request(app).post("/api/compiler/compile").send({ source: SPEC });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("SUCCESS");
    expect(res.body.data.runId).toBeNull();
    expect(db.compilationRun.create).not.toHaveBeenCalled();
  });

  it("saves the run for a logged-in student", async () => {
    const headers = asUser();
    db.compilationRun.create.mockResolvedValue({ id: "r1" });
    db.compilationRun.findMany.mockResolvedValue([]);
    const res = await request(app)
      .post("/api/compiler/compile")
      .set(headers)
      .send({ source: SPEC });
    expect(res.status).toBe(200);
    expect(res.body.data.runId).toBe("r1");
    const data = db.compilationRun.create.mock.calls[0][0].data;
    expect(data).toMatchObject({ userId: "u1", status: "SUCCESS", sourceCode: SPEC });
    expect(data.targetCode).toBeDefined();
  });

  it("rejects a programId that belongs to someone else", async () => {
    const headers = asUser();
    db.program.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .post("/api/compiler/compile")
      .set(headers)
      .send({ source: SPEC, programId: "p9" });
    expect(res.status).toBe(404);
    expect(db.compilationRun.create).not.toHaveBeenCalled();
  });

  it("still returns the result if saving the run fails", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const headers = asUser();
    db.compilationRun.create.mockRejectedValue(new Error("database down"));
    const res = await request(app)
      .post("/api/compiler/compile")
      .set(headers)
      .send({ source: SPEC });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("SUCCESS");
    expect(res.body.data.runId).toBeNull();
    spy.mockRestore();
  });

  it("requires login for history", async () => {
    const res = await request(app).get("/api/compiler/history");
    expect(res.status).toBe(401);
  });

  it("lists only the caller's history, with paging", async () => {
    const headers = asUser();
    db.compilationRun.findMany.mockResolvedValue([{ id: "r1" }]);
    db.compilationRun.count.mockResolvedValue(1);
    const res = await request(app).get("/api/compiler/history").set(headers);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ items: [{ id: "r1" }], page: 1, limit: 20, total: 1 });
    expect(db.compilationRun.findMany.mock.calls[0][0].where).toEqual({ userId: "u1" });
  });

  it("caps the page size at 50 and fixes a bad page", async () => {
    const headers = asUser();
    db.compilationRun.findMany.mockResolvedValue([]);
    db.compilationRun.count.mockResolvedValue(0);
    await request(app).get("/api/compiler/history?limit=1000&page=abc").set(headers);
    const args = db.compilationRun.findMany.mock.calls[0][0];
    expect(args.take).toBe(50);
    expect(args.skip).toBe(0);
  });

  it("returns 404 for a history item the caller does not own", async () => {
    const headers = asUser();
    db.compilationRun.findFirst.mockResolvedValue(null);
    const res = await request(app).get("/api/compiler/history/r9").set(headers);
    expect(res.status).toBe(404);
    expect(db.compilationRun.findFirst.mock.calls[0][0].where).toEqual({ id: "r9", userId: "u1" });
  });
});

describe("exercise submission", () => {
  it("requires login", async () => {
    const res = await request(app).post("/api/exercises/e1/submit").send({ sourceCode: "" });
    expect(res.status).toBe(401);
  });

  it("stores the compile outcome for the caller", async () => {
    const headers = asUser();
    db.exercise.findUnique.mockResolvedValue({ id: "e1" });
    db.exerciseSubmission.create.mockResolvedValue({ id: "s1", exerciseId: "e1" });
    const res = await request(app)
      .post("/api/exercises/e1/submit")
      .set(headers)
      .send({ sourceCode: 'int age = "hello";' });
    expect(res.status).toBe(201);
    const data = db.exerciseSubmission.create.mock.calls[0][0].data;
    expect(data.userId).toBe("u1");
    expect(data.exerciseId).toBe("e1");
    expect(data.result).toMatchObject({ status: "FAILED", failedPhase: "semantic", errorCount: 1 });
  });

  it("returns 404 for an unknown exercise", async () => {
    const headers = asUser();
    db.exercise.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .post("/api/exercises/missing/submit")
      .set(headers)
      .send({ sourceCode: "int a = 1;" });
    expect(res.status).toBe(404);
    expect(db.exerciseSubmission.create).not.toHaveBeenCalled();
  });
});
