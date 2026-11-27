import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { isPrismaCode } from "../utils/prismaErrors";
import type { LessonInput } from "../validators/lesson.validator";

// The list omits the long "content" field.
export function listLessons() {
  return prisma.lesson.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      difficulty: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getLesson(id: string) {
  const lesson = await prisma.lesson.findUnique({ where: { id } });
  if (!lesson) throw new ApiError(404, "Lesson not found.");
  return lesson;
}

export function createLesson(data: LessonInput) {
  return prisma.lesson.create({ data });
}

export async function updateLesson(id: string, data: LessonInput) {
  try {
    return await prisma.lesson.update({ where: { id }, data });
  } catch (error) {
    if (isPrismaCode(error, "P2025")) throw new ApiError(404, "Lesson not found.");
    throw error;
  }
}

export async function deleteLesson(id: string) {
  try {
    await prisma.lesson.delete({ where: { id } });
    return { id };
  } catch (error) {
    if (isPrismaCode(error, "P2025")) throw new ApiError(404, "Lesson not found.");
    throw error;
  }
}
