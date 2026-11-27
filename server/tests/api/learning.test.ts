import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  lessonFindMany: vi.fn(),
  lessonFindUnique: vi.fn(),
  exerciseFindMany: vi.fn(),
  exerciseFindUnique: vi.fn(),
}));

vi.mock("../../src/config/prisma", () => ({
  prisma: {
    lesson: { findMany: mocks.lessonFindMany, findUnique: mocks.lessonFindUnique },
    exercise: { findMany: mocks.exerciseFindMany, findUnique: mocks.exerciseFindUnique },
  },
}));

import app from "../../src/app";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/lessons", () => {
  it("lists lessons", async () => {
    mocks.lessonFindMany.mockResolvedValue([{ id: "l1", title: "What is a compiler?" }]);
    const res = await request(app).get("/api/lessons");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: [{ id: "l1", title: "What is a compiler?" }] });
  });

  it("does not select the long content field in the list", async () => {
    mocks.lessonFindMany.mockResolvedValue([]);
    await request(app).get("/api/lessons");
    expect(mocks.lessonFindMany.mock.calls[0][0].select).not.toHaveProperty("content");
  });

  it("returns one lesson", async () => {
    mocks.lessonFindUnique.mockResolvedValue({ id: "l1", content: "Full text" });
    const res = await request(app).get("/api/lessons/l1");
    expect(res.status).toBe(200);
    expect(res.body.data.content).toBe("Full text");
    expect(mocks.lessonFindUnique).toHaveBeenCalledWith({ where: { id: "l1" } });
  });

  it("returns 404 for an unknown lesson", async () => {
    mocks.lessonFindUnique.mockResolvedValue(null);
    const res = await request(app).get("/api/lessons/missing");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: "Lesson not found." });
  });

  it("rejects an absurdly long id with 400", async () => {
    const res = await request(app).get(`/api/lessons/${"x".repeat(100)}`);
    expect(res.status).toBe(400);
    expect(mocks.lessonFindUnique).not.toHaveBeenCalled();
  });
});

describe("GET /api/exercises", () => {
  it("lists exercises without the answer key", async () => {
    mocks.exerciseFindMany.mockResolvedValue([{ id: "e1", title: "Tokens" }]);
    const res = await request(app).get("/api/exercises");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(mocks.exerciseFindMany.mock.calls[0][0].select).not.toHaveProperty("expectedConcept");
  });

  it("returns one exercise without the answer key", async () => {
    mocks.exerciseFindUnique.mockResolvedValue({ id: "e1", starterCode: "int a = 1;" });
    const res = await request(app).get("/api/exercises/e1");
    expect(res.status).toBe(200);
    expect(res.body.data.starterCode).toBe("int a = 1;");
    expect(mocks.exerciseFindUnique.mock.calls[0][0].select).not.toHaveProperty("expectedConcept");
  });

  it("returns 404 for an unknown exercise", async () => {
    mocks.exerciseFindUnique.mockResolvedValue(null);
    const res = await request(app).get("/api/exercises/missing");
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Exercise not found.");
  });
});
