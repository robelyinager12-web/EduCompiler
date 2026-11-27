import { Prisma } from "@prisma/client";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn(), delete: vi.fn() },
  program: { count: vi.fn() },
  compilationRun: { count: vi.fn() },
  lesson: { create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
  exercise: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  exerciseSubmission: { count: vi.fn() },
}));
vi.mock("../../src/config/prisma", () => ({ prisma: db }));

import app from "../../src/app";
import { signToken } from "../../src/utils/jwt";

const adminUser = { id: "a1", name: "Admin", email: "admin@example.com", role: "ADMIN" };
const authHeader = { Authorization: `Bearer ${signToken("a1")}` };

function asRole(role: "ADMIN" | "STUDENT") {
  db.user.findUnique.mockResolvedValue({ ...adminUser, role });
  return authHeader;
}

const lessonBody = {
  title: "Parsing",
  description: "How parsers work",
  content: "A parser checks grammar.",
  category: "Syntax Analysis",
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("admin access control", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/admin/stats");
    expect(res.status).toBe(401);
  });

  it("returns 403 for a student", async () => {
    const res = await request(app).get("/api/admin/stats").set(asRole("STUDENT"));
    expect(res.status).toBe(403);
    expect(db.program.count).not.toHaveBeenCalled();
  });
});

describe("admin statistics and students", () => {
  it("returns system statistics", async () => {
    const headers = asRole("ADMIN");
    db.user.count.mockResolvedValue(5);
    db.program.count.mockResolvedValue(12);
    db.compilationRun.count.mockResolvedValueOnce(10).mockResolvedValueOnce(7);
    db.lesson.count.mockResolvedValue(2);
    db.exercise.count.mockResolvedValue(3);
    db.exerciseSubmission.count.mockResolvedValue(4);

    const res = await request(app).get("/api/admin/stats").set(headers);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      students: 5,
      programs: 12,
      compilations: 10,
      successfulCompilations: 7,
      failedCompilations: 3,
      lessons: 2,
      exercises: 3,
      submissions: 4,
    });
  });

  it("lists students only", async () => {
    const headers = asRole("ADMIN");
    db.user.findMany.mockResolvedValue([{ id: "s1" }]);
    db.user.count.mockResolvedValue(1);
    const res = await request(app).get("/api/admin/students").set(headers);
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(1);
    expect(db.user.findMany.mock.calls[0][0].where).toEqual({ role: "STUDENT" });
  });

  it("deletes a student", async () => {
    db.user.findUnique
      .mockResolvedValueOnce(adminUser)
      .mockResolvedValueOnce({ id: "s1", role: "STUDENT" });
    db.user.delete.mockResolvedValue({});
    const res = await request(app).delete("/api/admin/students/s1").set(authHeader);
    expect(res.status).toBe(200);
    expect(db.user.delete).toHaveBeenCalledWith({ where: { id: "s1" } });
  });

  it("refuses to delete an administrator account", async () => {
    db.user.findUnique
      .mockResolvedValueOnce(adminUser)
      .mockResolvedValueOnce({ id: "a2", role: "ADMIN" });
    const res = await request(app).delete("/api/admin/students/a2").set(authHeader);
    expect(res.status).toBe(403);
    expect(db.user.delete).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown student", async () => {
    db.user.findUnique.mockResolvedValueOnce(adminUser).mockResolvedValueOnce(null);
    const res = await request(app).delete("/api/admin/students/nope").set(authHeader);
    expect(res.status).toBe(404);
  });
});

describe("admin lessons", () => {
  it("creates a lesson with a default difficulty", async () => {
    const headers = asRole("ADMIN");
    db.lesson.create.mockResolvedValue({ id: "l1", ...lessonBody });
    const res = await request(app).post("/api/lessons").set(headers).send(lessonBody);
    expect(res.status).toBe(201);
    expect(db.lesson.create.mock.calls[0][0].data).toEqual({
      ...lessonBody,
      difficulty: "BEGINNER",
    });
  });

  it("does not let a student create a lesson", async () => {
    const headers = asRole("STUDENT");
    const res = await request(app).post("/api/lessons").set(headers).send(lessonBody);
    expect(res.status).toBe(403);
    expect(db.lesson.create).not.toHaveBeenCalled();
  });

  it("rejects an invalid lesson", async () => {
    const headers = asRole("ADMIN");
    const res = await request(app)
      .post("/api/lessons")
      .set(headers)
      .send({ ...lessonBody, difficulty: "IMPOSSIBLE" });
    expect(res.status).toBe(400);
    expect(db.lesson.create).not.toHaveBeenCalled();
  });

  it("returns 404 when updating a lesson that does not exist", async () => {
    const headers = asRole("ADMIN");
    db.lesson.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("missing", { code: "P2025", clientVersion: "test" }),
    );
    const res = await request(app).put("/api/lessons/nope").set(headers).send(lessonBody);
    expect(res.status).toBe(404);
  });

  it("deletes a lesson", async () => {
    const headers = asRole("ADMIN");
    db.lesson.delete.mockResolvedValue({});
    const res = await request(app).delete("/api/lessons/l1").set(headers);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ id: "l1" });
  });
});

describe("admin exercises", () => {
  it("shows the answer key to admins", async () => {
    const headers = asRole("ADMIN");
    db.exercise.findMany.mockResolvedValue([{ id: "e1", expectedConcept: "type mismatch" }]);
    const res = await request(app).get("/api/admin/exercises").set(headers);
    expect(res.status).toBe(200);
    expect(res.body.data[0].expectedConcept).toBe("type mismatch");
  });

  it("creates an exercise", async () => {
    const headers = asRole("ADMIN");
    const body = {
      title: "Find the error",
      description: "Spot the type error",
      instructions: "Fix the program.",
      starterCode: 'int a = "x";',
      expectedConcept: "error:type-mismatch",
    };
    db.exercise.create.mockResolvedValue({ id: "e1", ...body });
    const res = await request(app).post("/api/admin/exercises").set(headers).send(body);
    expect(res.status).toBe(201);
    expect(db.exercise.create.mock.calls[0][0].data.difficulty).toBe("BEGINNER");
  });
});
