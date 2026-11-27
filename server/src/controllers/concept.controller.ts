import type { Request, Response } from "express";
import { CONCEPTS } from "../services/exerciseChecker";

// Admin only (mounted under /admin). Lists what an exercise can be checked for.
export function getConceptsHandler(_req: Request, res: Response): void {
  res.json({
    success: true,
    data: CONCEPTS.map((c) => ({ key: c.key, label: c.label, description: c.expectation })),
  });
}
