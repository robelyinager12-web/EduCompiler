import { prisma } from "../config/prisma";

export async function getStats() {
  const [students, programs, compilations, successful, lessons, exercises, submissions] =
    await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.program.count(),
      prisma.compilationRun.count(),
      prisma.compilationRun.count({ where: { status: "SUCCESS" } }),
      prisma.lesson.count(),
      prisma.exercise.count(),
      prisma.exerciseSubmission.count(),
    ]);

  return {
    students,
    programs,
    compilations,
    successfulCompilations: successful,
    failedCompilations: compilations - successful,
    lessons,
    exercises,
    submissions,
  };
}
