import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { toJson } from "../utils/json";
import { isPrismaCode } from "../utils/prismaErrors";
import type { ExerciseInput } from "../validators/exercise.validator";
import { runCompiler } from "./compiler.service";
import { checkSubmission } from "./exerciseChecker";

// "expectedConcept" is the answer key. Student-facing queries never select it.
const publicFields = {
  id: true,
  title: true,
  description: true,
  difficulty: true,
  createdAt: true,
} as const;

export function listExercises() {
  return prisma.exercise.findMany({ select: publicFields, orderBy: { createdAt: "asc" } });
}

export async function getExercise(id: string) {
  const exercise = await prisma.exercise.findUnique({
    where: { id },
    select: { ...publicFields, instructions: true, starterCode: true, updatedAt: true },
  });
  if (!exercise) throw new ApiError(404, "Exercise not found.");
  return exercise;
}

// The answer key is read here, used for checking, and never returned.
export async function submitExercise(userId: string, exerciseId: string, sourceCode: string) {
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    select: { id: true, starterCode: true, expectedConcept: true },
  });
  if (!exercise) throw new ApiError(404, "Exercise not found.");

  const compiled = runCompiler(sourceCode, "full");
  const check = checkSubmission(
    exercise.expectedConcept,
    sourceCode,
    exercise.starterCode,
    compiled,
  );

  const result = {
    status: compiled.status,
    failedPhase: compiled.failedPhase,
    errorCount: compiled.errors.length,
    warningCount: compiled.warnings.length,
    errors: compiled.errors.slice(0, 20).map((e) => ({
      phase: e.phase,
      message: e.message,
      line: e.line,
      column: e.column,
    })),
    conceptChecked: check !== null,
    passed: check ? check.passed : null,
    feedback: check ? check.feedback : "Submitted. This exercise has no automatic check.",
  };

  return prisma.exerciseSubmission.create({
    data: { userId, exerciseId, sourceCode, result: toJson(result) },
    select: { id: true, exerciseId: true, result: true, submittedAt: true },
  });
}

// ---------- Admin: the answer key is visible here ----------

export function adminListExercises() {
  return prisma.exercise.findMany({ orderBy: { createdAt: "asc" } });
}

export async function adminGetExercise(id: string) {
  const exercise = await prisma.exercise.findUnique({ where: { id } });
  if (!exercise) throw new ApiError(404, "Exercise not found.");
  return exercise;
}

export function adminCreateExercise(data: ExerciseInput) {
  return prisma.exercise.create({ data });
}

export async function adminUpdateExercise(id: string, data: ExerciseInput) {
  try {
    return await prisma.exercise.update({ where: { id }, data });
  } catch (error) {
    if (isPrismaCode(error, "P2025")) throw new ApiError(404, "Exercise not found.");
    throw error;
  }
}

export async function adminDeleteExercise(id: string) {
  try {
    await prisma.exercise.delete({ where: { id } });
    return { id };
  } catch (error) {
    if (isPrismaCode(error, "P2025")) throw new ApiError(404, "Exercise not found.");
    throw error;
  }
}
