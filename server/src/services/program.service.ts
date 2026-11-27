import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import type { ProgramInput } from "../validators/program.validator";

const MAX_PROGRAMS = 100;

export function listPrograms(userId: string) {
  return prisma.program.findMany({
    where: { userId },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}

// The userId is part of the query, so another student's program is "not found".
export async function getProgram(userId: string, id: string) {
  const program = await prisma.program.findFirst({ where: { id, userId } });
  if (!program) throw new ApiError(404, "Program not found.");
  return program;
}

export async function createProgram(userId: string, data: ProgramInput) {
  const count = await prisma.program.count({ where: { userId } });
  if (count >= MAX_PROGRAMS) {
    throw new ApiError(400, `You can save at most ${MAX_PROGRAMS} programs. Delete one first.`);
  }
  return prisma.program.create({ data: { ...data, userId } });
}

export async function updateProgram(userId: string, id: string, data: ProgramInput) {
  await getProgram(userId, id);
  return prisma.program.update({ where: { id }, data });
}

export async function deleteProgram(userId: string, id: string) {
  await getProgram(userId, id);
  await prisma.program.delete({ where: { id } });
  return { id };
}
