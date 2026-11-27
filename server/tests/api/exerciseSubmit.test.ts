import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  exercise: { findUnique: vi.fn(), create: vi.fn() },
  exerciseSubmission: { create: vi.fn() },
}));
vi.mock("../../src/config/prisma", () => ({ prisma: db }));

import app from "../../src/app";
import { signToken } from "../../src/utils/jwt";

const header = { Authorization: `Bearer ${signToken("u1")}` };

function asRole(role: "STUDENT" | "ADMIN") {
  db.user.findUnique.mockResolvedValue({ id: "u1", name: "Abel", email: "a@b.com", role });
}

const exercise = { id: "e1", starterCode: 'int a = "x";', expectedConcept: "compiles" };

beforeEach(() => {
  vi.resetAllMocks();
  db.exerciseSubmission.create.mockResolvedValue({ id: "s1" });
});

describe("exercise submission checking", () => {
  it("records a pass for a correct solution", async () => {
    asRole("STUDENT");
    db.exercise.findUnique.mockResolvedValue(exercise);
    const res = await request(app)
      .post("/api/exercises/e1/submit")
      .set(header)
      .send({ sourceCode: "int a = 1;" });
    expect(res.status).toBe(201);
    expect(db.exerciseSubmission.create.mock.calls[0][0].data.result).toMatchObject({
      passed: true,
      conceptChecked: true,
    });
  });

  it("records a failure with feedback for a wrong solution", async () => {
    asRole("STUDENT");
    db.exercise.findUnique.mockResolvedValue(exercise);
    await request(app)
      .post("/api/exercises/e1/submit")
      .set(header)
      .send({ sourceCode: 'int a = "y";' });
    const result = db.exerciseSubmission.create.mock.calls[0][0].data.result;
    expect(result.passed).toBe(false);
    expect(result.feedback).toContain("Cannot assign STRING to INT.");
  });

  it("rejects the unchanged starter code", async () => {
    asRole("STUDENT");
    db.exercise.findUnique.mockResolvedValue(exercise);
    await request(app)
      .post("/api/exercises/e1/submit")
      .set(header)
      .send({ sourceCode: 'int a = "x";' });
    expect(db.exerciseSubmission.create.mock.calls[0][0].data.result.passed).toBe(false);
  });

  it("stores 'no automatic check' for an unknown concept", async () => {
    asRole("STUDENT");
    db.exercise.findUnique.mockResolvedValue({ ...exercise, expectedConcept: "type mismatch" });
    await request(app)
      .post("/api/exercises/e1/submit")
      .set(header)
      .send({ sourceCode: "int a = 1;" });
    expect(db.exerciseSubmission.create.mock.calls[0][0].data.result).toMatchObject({
      passed: null,
      conceptChecked: false,
    });
  });

  it("never selects or returns the answer key in the response", async () => {
    asRole("STUDENT");
    db.exercise.findUnique.mockResolvedValue(exercise);
    const res = await request(app)
      .post("/api/exercises/e1/submit")
      .set(header)
      .send({ sourceCode: "int a = 1;" });
    expect(JSON.stringify(res.body)).not.toContain("expectedConcept");
  });
});

describe("admin concepts", () => {
  it("is forbidden for students", async () => {
    asRole("STUDENT");
    const res = await request(app).get("/api/admin/concepts").set(header);
    expect(res.status).toBe(403);
  });

  it("lists concepts for administrators", async () => {
    asRole("ADMIN");
    const res = await request(app).get("/api/admin/concepts").set(header);
    expect(res.status).toBe(200);
    expect(res.body.data.map((c: { key: string }) => c.key)).toContain("compiles");
  });

  it("rejects an unknown concept when creating an exercise", async () => {
    asRole("ADMIN");
    const res = await request(app)
      .post("/api/admin/exercises")
      .set(header)
      .send({
        title: "T",
        description: "D",
        instructions: "I",
        starterCode: "",
        expectedConcept: "not-a-concept",
      });
    expect(res.status).toBe(400);
    expect(db.exercise.create).not.toHaveBeenCalled();
  });
});
