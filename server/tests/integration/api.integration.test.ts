import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../../src/app";

// These tests use the real app, real Prisma and a real PostgreSQL database (the TEST branch).
const enabled = Boolean(process.env.TEST_DATABASE_URL);
const RUN = Date.now().toString(36);
const prisma = new PrismaClient();

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
const emailOf = (name: string) => `it-${RUN}-${name}@example.test`;

interface Account {
  id: string;
  token: string;
}

async function signUp(name: string): Promise<Account> {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: `IT ${name}`, email: emailOf(name), password: "password123" });
  expect(res.status).toBe(201);
  return { id: res.body.data.user.id, token: res.body.data.token };
}

async function createAdmin(): Promise<Account> {
  const email = emailOf("admin");
  const user = await prisma.user.create({
    data: {
      name: "IT admin",
      email,
      passwordHash: await bcrypt.hash("password123", 4),
      role: "ADMIN",
    },
  });
  const res = await request(app).post("/api/auth/login").send({ email, password: "password123" });
  expect(res.status).toBe(200);
  return { id: user.id, token: res.body.data.token };
}

const exerciseBody = {
  title: `IT-${RUN} exercise`,
  description: "Fix the type error",
  instructions: "Make the program compile.",
  starterCode: 'int age = "hello";\nprint(age);',
  expectedConcept: "compiles",
};

afterAll(async () => {
  if (enabled) {
    // Only rows created by this run. Deleting users also removes their programs,
    // runs, submissions and lesson progress (cascade).
    await prisma.user.deleteMany({ where: { email: { startsWith: `it-${RUN}-` } } });
    await prisma.lesson.deleteMany({ where: { title: { startsWith: `IT-${RUN}` } } });
    await prisma.exercise.deleteMany({ where: { title: { startsWith: `IT-${RUN}` } } });
  }
  await prisma.$disconnect();
});

describe.skipIf(!enabled)("real database", () => {
  let alice: Account;
  let bob: Account;
  let admin: Account;
  let exerciseId = "";

  beforeAll(async () => {
    alice = await signUp("alice");
    bob = await signUp("bob");
    admin = await createAdmin();
  });

  it("reports the database as connected", async () => {
    const res = await request(app).get("/api/health");
    expect(res.body.database).toBe("connected");
  });

  describe("accounts", () => {
    it("enforces unique emails with the real constraint", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Again", email: emailOf("alice"), password: "password123" });
      expect(res.status).toBe(409);
    });

    it("stores a hashed password and ignores a requested role", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "IT mallory", email: emailOf("mallory"), password: "password123", role: "ADMIN" });
      expect(res.status).toBe(201);

      const row = await prisma.user.findUnique({ where: { email: emailOf("mallory") } });
      expect(row?.role).toBe("STUDENT");
      expect(row?.passwordHash.startsWith("$2")).toBe(true);
      expect(row?.passwordHash).not.toContain("password123");
    });

    it("logs in, and rejects a wrong password", async () => {
      const ok = await request(app)
        .post("/api/auth/login")
        .send({ email: emailOf("alice"), password: "password123" });
      expect(ok.status).toBe(200);
      const me = await request(app).get("/api/auth/me").set(bearer(ok.body.data.token));
      expect(me.body.data.user.email).toBe(emailOf("alice"));

      const wrong = await request(app)
        .post("/api/auth/login")
        .send({ email: emailOf("alice"), password: "wrong-password" });
      expect(wrong.status).toBe(401);
    });

    it("rejects the token of an account that was deleted", async () => {
      const ghost = await signUp("ghost");
      await prisma.user.delete({ where: { id: ghost.id } });
      const res = await request(app).get("/api/auth/me").set(bearer(ghost.token));
      expect(res.status).toBe(401);
    });
  });

  describe("programs and history", () => {
    it("saves, lists, updates and deletes a program", async () => {
      const created = await request(app)
        .post("/api/programs")
        .set(bearer(alice.token))
        .send({ title: `IT-${RUN} first`, sourceCode: "int a = 1;" });
      expect(created.status).toBe(201);
      const id = created.body.data.id as string;

      const list = await request(app).get("/api/programs").set(bearer(alice.token));
      expect(list.body.data.map((p: { id: string }) => p.id)).toContain(id);

      const updated = await request(app)
        .put(`/api/programs/${id}`)
        .set(bearer(alice.token))
        .send({ title: `IT-${RUN} renamed`, sourceCode: "int a = 2;" });
      expect(updated.status).toBe(200);

      const fetched = await request(app).get(`/api/programs/${id}`).set(bearer(alice.token));
      expect(fetched.body.data.sourceCode).toBe("int a = 2;");

      const removed = await request(app).delete(`/api/programs/${id}`).set(bearer(alice.token));
      expect(removed.status).toBe(200);
      const gone = await request(app).get(`/api/programs/${id}`).set(bearer(alice.token));
      expect(gone.status).toBe(404);
    });

    it("hides one student's program from another", async () => {
      const created = await request(app)
        .post("/api/programs")
        .set(bearer(alice.token))
        .send({ title: `IT-${RUN} private`, sourceCode: "int a = 1;" });
      const id = created.body.data.id as string;

      const asBob = bearer(bob.token);
      expect((await request(app).get(`/api/programs/${id}`).set(asBob)).status).toBe(404);
      expect(
        (await request(app).put(`/api/programs/${id}`).set(asBob).send({ title: "x", sourceCode: "" })).status,
      ).toBe(404);
      expect((await request(app).delete(`/api/programs/${id}`).set(asBob)).status).toBe(404);
      expect(
        (await request(app).post("/api/compiler/compile").set(asBob).send({ source: "int a = 1;", programId: id }))
          .status,
      ).toBe(404);

      const bobList = await request(app).get("/api/programs").set(asBob);
      expect(bobList.body.data.map((p: { id: string }) => p.id)).not.toContain(id);
    });

    it("keeps a run after its program is deleted (SetNull)", async () => {
      const created = await request(app)
        .post("/api/programs")
        .set(bearer(alice.token))
        .send({ title: `IT-${RUN} linked`, sourceCode: "int a = 1;" });
      const programId = created.body.data.id as string;

      const run = await request(app)
        .post("/api/compiler/compile")
        .set(bearer(alice.token))
        .send({ source: "int a = 1;", programId });
      const runId = run.body.data.runId as string;
      expect(runId).toEqual(expect.any(String));

      await request(app).delete(`/api/programs/${programId}`).set(bearer(alice.token));

      const detail = await request(app).get(`/api/compiler/history/${runId}`).set(bearer(alice.token));
      expect(detail.status).toBe(200);
      expect(detail.body.data.programId).toBeNull();
    });

    it("stores compile results as JSON and returns only the owner's history", async () => {
      const ok = await request(app)
        .post("/api/compiler/compile")
        .set(bearer(alice.token))
        .send({ source: "int a = 10;\nint b = 20;\nprint(a + b);" });
      const bad = await request(app)
        .post("/api/compiler/compile")
        .set(bearer(alice.token))
        .send({ source: 'int age = "hello";\nprint(unknown);' });
      expect(ok.body.data.status).toBe("SUCCESS");
      expect(bad.body.data.status).toBe("FAILED");
      const okId = ok.body.data.runId as string;
      const badId = bad.body.data.runId as string;

      const history = await request(app).get("/api/compiler/history?limit=50").set(bearer(alice.token));
      const ids = history.body.data.items.map((i: { id: string }) => i.id);
      expect(ids).toEqual(expect.arrayContaining([okId, badId]));

      const detail = await request(app).get(`/api/compiler/history/${okId}`).set(bearer(alice.token));
      expect(detail.body.data.status).toBe("SUCCESS");
      expect(Array.isArray(detail.body.data.tokens)).toBe(true);
      expect(detail.body.data.targetCode.text).toContain("PRINT #30");
      expect(detail.body.data.errors.phases).toHaveLength(6);

      const failed = await request(app).get(`/api/compiler/history/${badId}`).set(bearer(alice.token));
      expect(failed.body.data.status).toBe("FAILED");
      expect(failed.body.data.errors.errors).toHaveLength(2);
      expect(failed.body.data.targetCode).toBeNull();

      const asBob = bearer(bob.token);
      expect((await request(app).get(`/api/compiler/history/${okId}`).set(asBob)).status).toBe(404);
      const bobHistory = await request(app).get("/api/compiler/history").set(asBob);
      expect(bobHistory.body.data.total).toBe(0);
    });
  });

  describe("lessons and exercises", () => {
    it("lets only admins manage lessons, and tracks progress without duplicates", async () => {
      const body = {
        title: `IT-${RUN} lesson`,
        description: "d",
        content: "Full text",
        category: "Test",
      };
      expect((await request(app).post("/api/lessons").set(bearer(alice.token)).send(body)).status).toBe(403);

      const created = await request(app).post("/api/lessons").set(bearer(admin.token)).send(body);
      expect(created.status).toBe(201);
      const lessonId = created.body.data.id as string;

      const list = await request(app).get("/api/lessons");
      const item = list.body.data.find((l: { id: string }) => l.id === lessonId);
      expect(item).toBeDefined();
      expect(item).not.toHaveProperty("content");
      const one = await request(app).get(`/api/lessons/${lessonId}`);
      expect(one.body.data.content).toBe("Full text");

      const mark = () =>
        request(app).post(`/api/progress/lessons/${lessonId}`).set(bearer(alice.token));
      expect((await mark()).status).toBe(200);
      expect((await mark()).status).toBe(200);
      expect(await prisma.lessonProgress.count({ where: { userId: alice.id, lessonId } })).toBe(1);

      const progress = await request(app).get("/api/progress").set(bearer(alice.token));
      expect(progress.body.data.completedLessonIds).toContain(lessonId);

      await request(app).delete(`/api/progress/lessons/${lessonId}`).set(bearer(alice.token));
      expect(await prisma.lessonProgress.count({ where: { userId: alice.id, lessonId } })).toBe(0);

      const edited = await request(app)
        .put(`/api/lessons/${lessonId}`)
        .set(bearer(admin.token))
        .send({ ...body, title: `IT-${RUN} lesson edited` });
      expect(edited.status).toBe(200);
      expect((await request(app).delete(`/api/lessons/${lessonId}`).set(bearer(admin.token))).status).toBe(200);
      expect((await request(app).get(`/api/lessons/${lessonId}`)).status).toBe(404);
    });

    it("checks submissions against the answer key without revealing it", async () => {
      const bad = await request(app)
        .post("/api/admin/exercises")
        .set(bearer(admin.token))
        .send({ ...exerciseBody, expectedConcept: "nonsense" });
      expect(bad.status).toBe(400);

      const created = await request(app)
        .post("/api/admin/exercises")
        .set(bearer(admin.token))
        .send(exerciseBody);
      expect(created.status).toBe(201);
      exerciseId = created.body.data.id as string;

      const detail = await request(app).get(`/api/exercises/${exerciseId}`).set(bearer(alice.token));
      expect(JSON.stringify(detail.body)).not.toContain("expectedConcept");
      expect(JSON.stringify((await request(app).get("/api/exercises")).body)).not.toContain(
        "expectedConcept",
      );

      const submit = (sourceCode: string) =>
        request(app)
          .post(`/api/exercises/${exerciseId}/submit`)
          .set(bearer(alice.token))
          .send({ sourceCode });

      const unchanged = await submit(exerciseBody.starterCode);
      expect(unchanged.body.data.result.passed).toBe(false);
      expect(unchanged.body.data.result.feedback).toContain("Change the starter code");

      const wrong = await submit('int age = "bye";');
      expect(wrong.body.data.result.passed).toBe(false);

      const before = await request(app).get("/api/progress").set(bearer(alice.token));
      expect(before.body.data.completedExerciseIds).not.toContain(exerciseId);

      const right = await submit("int age = 20;\nprint(age);");
      expect(right.body.data.result.passed).toBe(true);

      // This runs the JSON path filter on real PostgreSQL, which mocks cannot check.
      const after = await request(app).get("/api/progress").set(bearer(alice.token));
      expect(after.body.data.completedExerciseIds).toContain(exerciseId);
      const bobProgress = await request(app).get("/api/progress").set(bearer(bob.token));
      expect(bobProgress.body.data.completedExerciseIds).not.toContain(exerciseId);

      const adminList = await request(app).get("/api/admin/exercises").set(bearer(admin.token));
      const row = adminList.body.data.find((e: { id: string }) => e.id === exerciseId);
      expect(row.expectedConcept).toBe("compiles");
    });
  });

  describe("administration", () => {
    it("cascades when an admin deletes a student, and protects admin accounts", async () => {
      const victim = await signUp("victim");
      const asVictim = bearer(victim.token);

      await request(app).post("/api/programs").set(asVictim).send({ title: `IT-${RUN} v`, sourceCode: "int a = 1;" });
      await request(app).post("/api/compiler/compile").set(asVictim).send({ source: "int a = 1;" });
      await request(app)
        .post(`/api/exercises/${exerciseId}/submit`)
        .set(asVictim)
        .send({ sourceCode: "int age = 1;" });

      expect(await prisma.program.count({ where: { userId: victim.id } })).toBe(1);
      expect(await prisma.compilationRun.count({ where: { userId: victim.id } })).toBe(1);
      expect(await prisma.exerciseSubmission.count({ where: { userId: victim.id } })).toBe(1);

      const removed = await request(app)
        .delete(`/api/admin/students/${victim.id}`)
        .set(bearer(admin.token));
      expect(removed.status).toBe(200);

      expect(await prisma.user.count({ where: { id: victim.id } })).toBe(0);
      expect(await prisma.program.count({ where: { userId: victim.id } })).toBe(0);
      expect(await prisma.compilationRun.count({ where: { userId: victim.id } })).toBe(0);
      expect(await prisma.exerciseSubmission.count({ where: { userId: victim.id } })).toBe(0);

      const protectedAdmin = await request(app)
        .delete(`/api/admin/students/${admin.id}`)
        .set(bearer(admin.token));
      expect(protectedAdmin.status).toBe(403);
    });

    it("limits statistics to administrators", async () => {
      expect((await request(app).get("/api/admin/stats").set(bearer(alice.token))).status).toBe(403);
      expect((await request(app).get("/api/admin/stats")).status).toBe(401);

      const stats = await request(app).get("/api/admin/stats").set(bearer(admin.token));
      expect(stats.status).toBe(200);
      expect(stats.body.data.students).toBeGreaterThanOrEqual(2);
      expect(stats.body.data.compilations).toBeGreaterThanOrEqual(2);
    });
  });
});
