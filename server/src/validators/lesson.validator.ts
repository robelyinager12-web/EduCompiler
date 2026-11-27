import { z } from "zod";

export const difficultySchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);

export const lessonBodySchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().min(1).max(500),
  content: z.string().min(1).max(50000),
  category: z.string().trim().min(1).max(60),
  difficulty: difficultySchema.default("BEGINNER"),
});

export type LessonInput = z.infer<typeof lessonBodySchema>;
