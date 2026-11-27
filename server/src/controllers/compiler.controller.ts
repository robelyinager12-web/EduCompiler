import type { Request, Response } from "express";
import {
  assertProgramOwned,
  getRun,
  listRuns,
  runCompiler,
  saveRun,
  type CompilerStage,
} from "../services/compiler.service";
import { asyncHandler } from "../utils/asyncHandler";
import { currentUser } from "../utils/currentUser";
import { parsePaging } from "../utils/paging";

// Used by /lexical, /syntax and /semantic. The body was already validated.
export const compileHandler =
  (stage: CompilerStage) =>
  (req: Request, res: Response): void => {
    const { source } = req.body as { source: string };
    res.json({ success: true, data: runCompiler(source, stage) });
  };

// /compile saves the run when a logged-in student calls it.
export const compileFull = asyncHandler(async (req, res) => {
  const { source, programId } = req.body as { source: string; programId?: string };
  const user = req.user;

  if (user && programId) await assertProgramOwned(user.id, programId);

  const result = runCompiler(source, "full");

  let runId: string | null = null;
  if (user) {
    try {
      runId = await saveRun(user.id, programId, source, result);
    } catch (error) {
      // The student still gets the compile result.
      console.error("Could not save compilation run:", error);
    }
  }

  res.json({ success: true, data: { ...result, runId } });
});

export const getHistory = asyncHandler(async (req, res) => {
  const user = currentUser(req);
  res.json({ success: true, data: await listRuns(user.id, parsePaging(req.query)) });
});

export const getHistoryItem = asyncHandler(async (req, res) => {
  const user = currentUser(req);
  res.json({ success: true, data: await getRun(user.id, String(req.params.id)) });
});
