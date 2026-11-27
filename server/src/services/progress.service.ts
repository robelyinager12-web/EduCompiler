import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

export async function getProgress(userId: string) {
  const [programs, compilations, completed, totalLessons] = await Promise.all([
    prisma.program.count({ where: { userId } }),
    prisma.compilationRun.count({ where: { userId } }),
    prisma.lessonProgress.findMany({ where: { userId }, select: { lessonId: true } }),
    prisma.lesson.count(),
  ]);

  return {
    programs,
    compilations,
    completedLessonIds: completed.map((c) => c.lessonId),
    totalLessons,
  };
}

// Safe to call twice: the unique (userId, lessonId) pair makes it idempotent.
export async function completeLesson(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
  if (!lesson) throw new ApiError(404, "Lesson not found.");

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {},
    create: { userId, lessonId },
  });
  return { lessonId, completed: true };
}

export async function uncompleteLesson(userId: string, lessonId: string) {
  await prisma.lessonProgress.deleteMany({ where: { userId, lessonId } });
  return { lessonId, completed: false };
}
