import { z } from "zod";
import { difficultySchema } from "./lesson.validator";

export const exerciseBodySchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().min(1).max(500),
  instructions: z.string().min(1).max(20000),
  starterCode: z.string().max(20000),
  expectedConcept: z.string().trim().min(1).max(200),
  difficulty: difficultySchema.default("BEGINNER"),
});

export const submitBodySchema = z.object({
  sourceCode: z.string().max(20000),
});

export type ExerciseInput = z.infer<typeof exerciseBodySchema>;
