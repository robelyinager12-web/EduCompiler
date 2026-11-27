import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import type { Paging } from "../utils/paging";

export async function listStudents({ page, limit, skip }: Paging) {
  const where = { role: "STUDENT" as const };
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: { select: { programs: true, runs: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);
  return { items, page, limit, total };
}

// Deleting a student also deletes their programs, runs and submissions (cascade).
export async function deleteStudent(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!user) throw new ApiError(404, "Student not found.");
  if (user.role !== "STUDENT") {
    throw new ApiError(403, "Administrator accounts cannot be deleted here.");
  }
  await prisma.user.delete({ where: { id } });
  return { id };
}
