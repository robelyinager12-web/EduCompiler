import { z } from "zod";

// Used for routes like /lessons/:id
export const idParamSchema = z.object({
  id: z.string().min(1).max(50),
});
