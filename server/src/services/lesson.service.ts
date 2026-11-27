import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

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
