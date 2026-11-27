import { z } from "zod";

export const programBodySchema = z.object({
  title: z.string().trim().min(1).max(120),
  sourceCode: z.string().max(20000),
});

export type ProgramInput = z.infer<typeof programBodySchema>;
