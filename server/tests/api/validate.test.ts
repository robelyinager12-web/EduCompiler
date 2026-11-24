import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { errorHandler } from "../../src/middleware/error.middleware";
import { validate } from "../../src/middleware/validate.middleware";

const schema = z.object({ email: z.string().email() });
const testApp = express();
testApp.use(express.json());
testApp.post("/test", validate(schema), (req, res) => {
  res.json({ ok: true, email: req.body.email });
});
testApp.use(errorHandler);

describe("validate middleware", () => {
  it("accepts valid input", async () => {
    const res = await request(testApp).post("/test").send({ email: "a@b.com" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("rejects invalid input with 400", async () => {
    const res = await request(testApp).post("/test").send({ email: "not-an-email" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
