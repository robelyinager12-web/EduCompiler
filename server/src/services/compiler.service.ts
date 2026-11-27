import { prisma } from "../config/prisma";
import { compile, type CompileResult } from "../compiler";
import { ApiError } from "../utils/ApiError";
import { optionalJson, toJson } from "../utils/json";
import type { Paging } from "../utils/paging";

export type CompilerStage = "lexical" | "syntax" | "semantic" | "full";

const MAX_RUNS_PER_USER = 200;

// A thin wrapper: the service decides how far to run, the engine does the work.
export function runCompiler(source: string, stage: CompilerStage): CompileResult {
  return compile(source, stage === "full" ? {} : { stopAfter: stage });
}

export async function assertProgramOwned(userId: string, programId: string): Promise<void> {
  const program = await prisma.program.findFirst({
    where: { id: programId, userId },
    select: { id: true },
  });
  if (!program) throw new ApiError(404, "Program not found.");
}

// Saves one run. The "errors" column holds failedPhase, phases, errors and warnings.
export async function saveRun(
  userId: string,
  programId: string | undefined,
  sourceCode: string,
  result: CompileResult,
): Promise<string> {
  const run = await prisma.compilationRun.create({
    data: {
      userId,
      programId,
      sourceCode,
      status: result.status,
      tokens: optionalJson(result.tokens),
      syntaxTree: optionalJson(result.ast),
      symbolTable: optionalJson(result.symbolTable),
      intermediateCode: optionalJson(result.intermediateCode),
      optimizedCode: optionalJson(result.optimization),
      targetCode: optionalJson(result.target),
      errors: toJson({
        failedPhase: result.failedPhase,
        phases: result.phases,
        errors: result.errors,
        warnings: result.warnings,
      }),
    },
    select: { id: true },
  });

  // Keep only the newest runs. A failure here must not hide the saved run.
  try {
    const old = await prisma.compilationRun.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: MAX_RUNS_PER_USER,
      select: { id: true },
    });
    if (old.length > 0) {
      await prisma.compilationRun.deleteMany({ where: { id: { in: old.map((r) => r.id) } } });
    }
  } catch (error) {
    console.error("Could not prune old compilation runs:", error);
  }

  return run.id;
}

export async function listRuns(userId: string, { page, limit, skip }: Paging) {
  const [items, total] = await Promise.all([
    prisma.compilationRun.findMany({
      where: { userId },
      select: { id: true, programId: true, status: true, sourceCode: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.compilationRun.count({ where: { userId } }),
  ]);
  return { items, page, limit, total };
}

export async function getRun(userId: string, id: string) {
  const run = await prisma.compilationRun.findFirst({ where: { id, userId } });
  if (!run) throw new ApiError(404, "Compilation run not found.");
  return run;
}
