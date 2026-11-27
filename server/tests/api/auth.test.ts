import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), create: vi.fn() },
}));
vi.mock("../../src/config/prisma", () => ({ prisma: db }));

import app from "../../src/app";
import { signToken } from "../../src/utils/jwt";
import { hashPassword } from "../../src/utils/password";

const student = { id: "u1", name: "Abel", email: "abel@example.com", role: "STUDENT" };

beforeEach(() => {
  vi.resetAllMocks();
});

describe("POST /api/auth/register", () => {
  it("creates a STUDENT, hashes the password and ignores a role in the body", async () => {
    db.user.create.mockResolvedValue({ ...student, createdAt: new Date() });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Abel", email: "Abel@Example.com", password: "password123", role: "ADMIN" });

    expect(res.status).toBe(201);
    expect(typeof res.body.data.token).toBe("string");
    expect(res.body.data.user.role).toBe("STUDENT");
    expect(res.body.data.user).not.toHaveProperty("passwordHash");

    const data = db.user.create.mock.calls[0][0].data;
    expect(data.role).toBe("STUDENT");
    expect(data.email).toBe("abel@example.com");
    expect(data.passwordHash).not.toBe("password123");
    expect(data.passwordHash.startsWith("$2")).toBe(true);
  });

  it("rejects a short password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Abel", email: "abel@example.com", password: "short" });
    expect(res.status).toBe(400);
    expect(db.user.create).not.toHaveBeenCalled();
  });

  it("returns 409 for a duplicate email", async () => {
    db.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("duplicate", { code: "P2002", clientVersion: "test" }),
    );
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Abel", email: "abel@example.com", password: "password123" });
    expect(res.status).toBe(409);
    expect(res.body.message).toBe("An account with this email already exists.");
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with the right password", async () => {
    db.user.findUnique.mockResolvedValue({
      ...student,
      passwordHash: await hashPassword("password123"),
      createdAt: new Date(),
    });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "abel@example.com", password: "password123" });
    expect(res.status).toBe(200);
    expect(typeof res.body.data.token).toBe("string");
    expect(JSON.stringify(res.body)).not.toContain("passwordHash");
  });

  it("gives one message for a wrong password", async () => {
    db.user.findUnique.mockResolvedValue({
      ...student,
      passwordHash: await hashPassword("password123"),
      createdAt: new Date(),
    });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "abel@example.com", password: "wrong-password" });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password.");
  });

  it("gives the same message for an unknown email", async () => {
    db.user.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "password123" });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password.");
  });
});

describe("GET /api/auth/me", () => {
  it("requires a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns the current user for a valid token", async () => {
    db.user.findUnique.mockResolvedValue(student);
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${signToken("u1")}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user).toEqual(student);
  });

  it("rejects a token signed with another secret", async () => {
    const forged = jwt.sign({}, "some-other-secret-some-other-secret-1234", { subject: "u1" });
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${forged}`);
    expect(res.status).toBe(401);
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });

  it("rejects a valid token for an account that no longer exists", async () => {
    db.user.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${signToken("u1")}`);
    expect(res.status).toBe(401);
  });
});
