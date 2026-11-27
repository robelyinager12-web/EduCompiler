import { compile, type CompileResult } from "../compiler";

export type CompilerStage = "lexical" | "syntax" | "semantic" | "full";

// A thin wrapper: the service decides how far to run, the engine does the work.
export function runCompiler(source: string, stage: CompilerStage): CompileResult {
  return compile(source, stage === "full" ? {} : { stopAfter: stage });
}
