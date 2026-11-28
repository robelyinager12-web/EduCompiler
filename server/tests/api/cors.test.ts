import request from "supertest";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/config/prisma", () => ({ prisma: {} }));

import app from "../../src/app";

describe("CORS", () => {
  it("allows the configured client origin", async () => {
    const res = await request(app).get("/api/nope").set("Origin", "http://localhost:5173");
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
  });

  it("sends no CORS headers to other origins, and does not fail", async () => {
    const res = await request(app).get("/api/nope").set("Origin", "https://evil.example");
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
    expect(res.status).toBe(404);
  });

  it("allows requests without an Origin header", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
  });
});
