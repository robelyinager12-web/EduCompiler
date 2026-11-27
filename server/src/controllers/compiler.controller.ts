import type { Request, Response } from "express";
import { runCompiler, type CompilerStage } from "../services/compiler.service";

// One handler for all four endpoints. The body was already validated.
export const compileHandler =
  (stage: CompilerStage) =>
  (req: Request, res: Response): void => {
    const { source } = req.body as { source: string };
    res.json({ success: true, data: runCompiler(source, stage) });
  };
