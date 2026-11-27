import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { exercises, lessons } from "./seedData";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name: "Administrator", email, passwordHash, role: "ADMIN" },
  });

  // Safe to run again: items are matched by title and only created when missing.
  for (const lesson of lessons) {
    const existing = await prisma.lesson.findFirst({ where: { title: lesson.title } });
    if (!existing) await prisma.lesson.create({ data: lesson });
  }

  for (const exercise of exercises) {
    const { solution, ...data } = exercise;
    void solution; // the reference solution is for tests only
    const existing = await prisma.exercise.findFirst({ where: { title: data.title } });
    if (!existing) await prisma.exercise.create({ data });
  }

  console.log(`Seed complete. Admin: ${email}. Lessons: ${lessons.length}. Exercises: ${exercises.length}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
