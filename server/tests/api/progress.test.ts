import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  program: { count: vi.fn() },
  compilationRun: { count: vi.fn() },
  lesson: { count: vi.fn(), findUnique: vi.fn() },
  lessonProgress: { findMany: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
  exercise: { count: vi.fn() },
  exerciseSubmission: { findMany: vi.fn() },
}));
vi.mock("../../src/config/prisma", () => ({ prisma: db }));

import app from "../../src/app";
import { signToken } from "../../src/utils/jwt";

function asUser() {
  db.user.findUnique.mockResolvedValue({
    id: "u1",
    name: "Abel",
    email: "abel@example.com",
    role: "STUDENT",
  });
  return { Authorization: `Bearer ${signToken("u1")}` };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("progress", () => {
  it("requires login", async () => {
    const res = await request(app).get("/api/progress");
    expect(res.status).toBe(401);
  });

  it("returns the caller's counts, completed lessons and passed exercises", async () => {
    const headers = asUser();
    db.program.count.mockResolvedValue(3);
    db.compilationRun.count.mockResolvedValue(12);
    db.lessonProgress.findMany.mockResolvedValue([{ lessonId: "l1" }]);
    db.lesson.count.mockResolvedValue(4);
    db.exerciseSubmission.findMany.mockResolvedValue([{ exerciseId: "e1" }]);
    db.exercise.count.mockResolvedValue(10);

    const res = await request(app).get("/api/progress").set(headers);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      programs: 3,
      compilations: 12,
      completedLessonIds: ["l1"],
      totalLessons: 4,
      completedExerciseIds: ["e1"],
      totalExercises: 10,
    });
    expect(db.program.count.mock.calls[0][0].where).toEqual({ userId: "u1" });
    expect(db.exerciseSubmission.findMany.mock.calls[0][0].where).toEqual({
      userId: "u1",
      result: { path: ["passed"], equals: true },
    });
  });

  it("marks a lesson complete for the caller", async () => {
    const headers = asUser();
    db.lesson.findUnique.mockResolvedValue({ id: "l1" });
    db.lessonProgress.upsert.mockResolvedValue({});
    const res = await request(app).post("/api/progress/lessons/l1").set(headers);
    expect(res.status).toBe(200);
    expect(db.lessonProgress.upsert.mock.calls[0][0].where).toEqual({
      userId_lessonId: { userId: "u1", lessonId: "l1" },
    });
  });

  it("returns 404 when completing an unknown lesson", async () => {
    const headers = asUser();
    db.lesson.findUnique.mockResolvedValue(null);
    const res = await request(app).post("/api/progress/lessons/nope").set(headers);
    expect(res.status).toBe(404);
    expect(db.lessonProgress.upsert).not.toHaveBeenCalled();
  });

  it("removes only the caller's completion", async () => {
    const headers = asUser();
    db.lessonProgress.deleteMany.mockResolvedValue({ count: 1 });
    const res = await request(app).delete("/api/progress/lessons/l1").set(headers);
    expect(res.status).toBe(200);
    expect(db.lessonProgress.deleteMany.mock.calls[0][0].where).toEqual({
      userId: "u1",
      lessonId: "l1",
    });
  });
});
