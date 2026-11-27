import { z } from "zod";

// Source length is checked by the compiler itself (20000 characters), so a long
// program gets a normal diagnostic instead of an HTTP error.
export const compileBodySchema = z.object({
  source: z.string(),
  // Optional: link the saved run to one of the student's programs.
  programId: z.string().min(1).max(50).optional(),
});
