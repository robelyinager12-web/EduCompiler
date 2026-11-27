import { useState } from "react";
import type { CompileResult } from "../../types/compiler.types";
import Badge from "../common/Badge";
import CodeBlock from "../common/CodeBlock";
import ErrorMessage from "../common/ErrorMessage";
import Loader from "../common/Loader";
import AstViewer from "./AstViewer";
import ErrorList from "./ErrorList";
import OptimizationView from "./OptimizationView";
import PipelineDiagram from "./PipelineDiagram";
import SymbolTableView from "./SymbolTableView";
import TargetCodeView from "./TargetCodeView";
import TokenTable from "./TokenTable";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "tokens", label: "Tokens" },
  { id: "ast", label: "AST" },
  { id: "semantic", label: "Semantic" },
  { id: "tac", label: "TAC" },
  { id: "optimized", label: "Optimized" },
  { id: "target", label: "Target" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Props {
  result: CompileResult | null;
  stale: boolean;
  running: boolean;
  runError: string | null;
}

function Unavailable({ result }: { result: CompileResult | null }) {
  const text = !result
    ? "Run the program to see this output."
    : result.failedPhase
      ? `Not available: compilation stopped at the ${result.failedPhase} phase.`
      : "Not available for this run.";
  return <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>;
}

export default function WorkspaceRightPanel({ result, stale, running, runError }: Props) {
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div
        role="tablist"
        aria-label="Compiler phases"
        className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200 p-2 dark:border-slate-700"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="phase-panel"
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${
              tab === t.id
                ? "bg-indigo-600 font-medium text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id="phase-panel"
        aria-labelledby={`tab-${tab}`}
        className="min-h-0 flex-1 space-y-3 overflow-auto p-4"
      >
        {running && <Loader label="Compiling..." />}
        {runError && <ErrorMessage message={runError} />}
        {stale && result && (
          <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            The editor changed since this run. Press Run to update the results.
          </p>
        )}

        {tab === "overview" &&
          (result ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={result.status === "SUCCESS" ? "green" : "red"}>
                  {result.status === "SUCCESS" ? "Compilation succeeded" : "Compilation failed"}
                </Badge>
                {result.failedPhase && <span className="text-sm">Stopped at: {result.failedPhase}</span>}
                <span className="text-sm text-slate-500">
                  {result.errors.length} errors, {result.warnings.length} warnings
                </span>
              </div>
              <ErrorList diagnostics={[...result.errors, ...result.warnings]} />
              <PipelineDiagram phases={result.phases} />
            </>
          ) : (
            <Unavailable result={null} />
          ))}

        {tab === "tokens" &&
          (result?.tokens ? <TokenTable tokens={result.tokens} /> : <Unavailable result={result} />)}

        {tab === "ast" &&
          (result?.ast ? <AstViewer ast={result.ast} /> : <Unavailable result={result} />)}

        {tab === "semantic" &&
          (result?.symbolTable ? (
            <>
              <h3 className="text-sm font-semibold">Symbol table</h3>
              <SymbolTableView symbols={result.symbolTable} />
              <ErrorList
                diagnostics={[...result.errors, ...result.warnings].filter((d) => d.phase === "semantic")}
              />
            </>
          ) : (
            <Unavailable result={result} />
          ))}

        {tab === "tac" &&
          (result?.intermediateCode ? (
            <>
              <CodeBlock code={result.intermediateCode.text} label="Three-address code" />
              <p className="text-xs text-slate-500">
                Three-address code: each line does at most one operation. t1, t2... are temporaries.
              </p>
            </>
          ) : (
            <Unavailable result={result} />
          ))}

        {tab === "optimized" &&
          (result?.optimization && result.intermediateCode ? (
            <OptimizationView
              before={result.intermediateCode.text}
              after={result.optimization.text}
              steps={result.optimization.steps}
              stats={result.optimization.stats}
            />
          ) : (
            <Unavailable result={result} />
          ))}

        {tab === "target" &&
          (result?.target ? (
            <TargetCodeView
              text={result.target.text}
              note={result.target.note}
              mapping={result.target.mapping}
              registersUsed={result.target.registersUsed}
            />
          ) : (
            <Unavailable result={result} />
          ))}
      </div>
    </div>
  );
}
