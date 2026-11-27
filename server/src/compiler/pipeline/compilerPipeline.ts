import { formatTarget, generateTarget } from "../code-generator";
import { createDiagnostic, type CompilerPhase, type Diagnostic } from "../errors/CompilerError";
import { formatTac, generateTac } from "../intermediate";
import { tokenize } from "../lexer";
import { optimize } from "../optimizer";
import { parse } from "../parser";
import { analyze } from "../semantic";
import type { CompileOptions, CompileResult, PhaseReport } from "./pipeline.types";

export const MAX_SOURCE_LENGTH = 20000;

const PHASES: { phase: CompilerPhase; label: string }[] = [
  { phase: "lexical", label: "Lexical analysis" },
  { phase: "syntax", label: "Syntax analysis" },
  { phase: "semantic", label: "Semantic analysis" },
  { phase: "intermediate", label: "Intermediate code" },
  { phase: "optimization", label: "Code optimization" },
  { phase: "codegen", label: "Educational target code" },
];

export function compile(source: string, options: CompileOptions = {}): CompileResult {
  const errors: Diagnostic[] = [];
  const warnings: Diagnostic[] = [];
  let failedPhase: CompilerPhase | null = null;

  const reports = new Map<CompilerPhase, PhaseReport>(
    PHASES.map((p) => [p.phase, { ...p, status: "skipped", errors: 0, warnings: 0 }]),
  );

  const output: Pick<
    CompileResult,
    "tokens" | "ast" | "symbolTable" | "intermediateCode" | "optimization" | "target"
  > = {
    tokens: null,
    ast: null,
    symbolTable: null,
    intermediateCode: null,
    optimization: null,
    target: null,
  };

  const succeed = (phase: CompilerPhase, warningCount = 0): void => {
    const report = reports.get(phase);
    if (report) Object.assign(report, { status: "success", warnings: warningCount });
  };

  const finish = (): CompileResult => ({
    status: failedPhase === null ? "SUCCESS" : "FAILED",
    failedPhase,
    phases: PHASES.map((p) => reports.get(p.phase) as PhaseReport),
    ...output,
    errors,
    warnings,
  });

  const fail = (phase: CompilerPhase, diagnostics: Diagnostic[], warningCount = 0): CompileResult => {
    errors.push(...diagnostics);
    failedPhase = phase;
    const report = reports.get(phase);
    if (report) {
      Object.assign(report, { status: "failed", errors: diagnostics.length, warnings: warningCount });
    }
    return finish();
  };

  const stopAfter = options.stopAfter;

  if (source.length > MAX_SOURCE_LENGTH) {
    return fail("lexical", [
      createDiagnostic(
        "lexical",
        `Source code is too long (maximum ${MAX_SOURCE_LENGTH} characters).`,
        1,
        1,
      ),
    ]);
  }

  const lexed = tokenize(source);
  output.tokens = lexed.tokens;
  if (lexed.errors.length > 0) return fail("lexical", lexed.errors);
  succeed("lexical");
  if (stopAfter === "lexical") return finish();

  const parsed = parse(lexed.tokens);
  if (parsed.errors.length > 0) return fail("syntax", parsed.errors);
  output.ast = parsed.program;
  succeed("syntax");
  if (stopAfter === "syntax") return finish();

  const semantic = analyze(parsed.program);
  output.symbolTable = semantic.symbolTable;
  warnings.push(...semantic.warnings);
  if (semantic.errors.length > 0) {
    return fail("semantic", semantic.errors, semantic.warnings.length);
  }
  succeed("semantic", semantic.warnings.length);
  if (stopAfter === "semantic") return finish();

  const tac = generateTac(parsed.program, semantic.symbolTable);
  output.intermediateCode = { instructions: tac, text: formatTac(tac) };
  succeed("intermediate");
  if (stopAfter === "intermediate") return finish();

  const optimized = optimize(tac, semantic.symbolTable);
  output.optimization = { ...optimized, text: formatTac(optimized.instructions) };
  succeed("optimization");
  if (stopAfter === "optimization") return finish();

  const target = generateTarget(optimized.instructions, semantic.symbolTable);
  output.target = { ...target, text: formatTarget(target.instructions) };
  succeed("codegen");

  return finish();
}
