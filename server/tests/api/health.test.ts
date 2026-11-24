import request from "supertest";
import { describe, expect, it, vi } from "vitest";

// Replace the real database client with a fake one for this test file.
vi.mock("../../src/config/prisma", () => ({
  prisma: { $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]) },
}));

import app from "../../src/app";

describe("GET /api/health", () => {
  it("returns status ok and database connected", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("EduCompiler API");
    expect(res.body.database).toBe("connected");
  });
});

describe("unknown routes", () => {
  it("returns a JSON 404", async () => {
    const res = await request(app).get("/api/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
