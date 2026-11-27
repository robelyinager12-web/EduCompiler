import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

// "expectedConcept" is the answer key used to check submissions (Phase 15).
// It is never selected here, so it can't leak to the browser.
const publicFields = {
  id: true,
  title: true,
  description: true,
  difficulty: true,
  createdAt: true,
} as const;

export function listExercises() {
  return prisma.exercise.findMany({
    select: publicFields,
    orderBy: { createdAt: "asc" },
  });
}

export async function getExercise(id: string) {
  const exercise = await prisma.exercise.findUnique({
    where: { id },
    select: { ...publicFields, instructions: true, starterCode: true, updatedAt: true },
  });
  if (!exercise) throw new ApiError(404, "Exercise not found.");
  return exercise;
}
