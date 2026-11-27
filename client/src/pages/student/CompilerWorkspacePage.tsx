import { Play, RotateCcw, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/common/Button";
import ErrorMessage from "../../components/common/ErrorMessage";
import PageState from "../../components/common/PageState";
import WorkspaceLeftPanel from "../../components/compiler/WorkspaceLeftPanel";
import WorkspaceRightPanel from "../../components/compiler/WorkspaceRightPanel";
import CodeEditor from "../../components/editor/CodeEditor";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../services/api";
import { compileSource } from "../../services/compilerService";
import {
  createProgram,
  fetchProgram,
  fetchPrograms,
  updateProgram,
} from "../../services/programService";
import type { CompileResult } from "../../types/compiler.types";
import type { Program } from "../../types/program.types";
import { EXAMPLES, type ExampleProgram } from "../../utils/examplePrograms";

function Workspace({ initial }: { initial: Program | null }) {
  const navigate = useNavigate();
  const programs = useFetch(fetchPrograms, "workspace-programs");

  const [source, setSource] = useState(initial?.sourceCode ?? EXAMPLES[0].source);
  const [baseSource, setBaseSource] = useState(initial?.sourceCode ?? EXAMPLES[0].source);
  const [programId, setProgramId] = useState<string | null>(initial?.id ?? null);
  const [title, setTitle] = useState<string | null>(initial?.title ?? null);

  const [result, setResult] = useState<CompileResult | null>(null);
  const [resultSource, setResultSource] = useState("");
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const dirty = source !== baseSource;
  const stale = result !== null && resultSource !== source;

  // Squiggles are hidden once the text no longer matches the compiled text.
  const diagnostics = useMemo(
    () => (result && !stale ? [...result.errors, ...result.warnings] : []),
    [result, stale],
  );

  const confirmDiscard = () => !dirty || window.confirm("You have unsaved changes. Discard them?");

  async function run() {
    if (running) return;
    setRunning(true);
    setRunError(null);
    setNotice(null);
    try {
      const compiled = await compileSource(source, programId ?? undefined);
      setResult(compiled);
      setResultSource(source);
    } catch (err) {
      setRunError(getErrorMessage(err));
    } finally {
      setRunning(false);
    }
  }

  async function save() {
    if (saving) return;
    setRunError(null);
    setNotice(null);

    let name = title;
    if (!programId) {
      const answer = window.prompt("Name this program:", "My program");
      if (!answer || !answer.trim()) return;
      name = answer.trim().slice(0, 120);
    }

    setSaving(true);
    try {
      if (programId && name) {
        await updateProgram(programId, name, source);
      } else if (name) {
        const created = await createProgram(name, source);
        setProgramId(created.id);
        setTitle(created.title);
      }
      setBaseSource(source);
      setNotice("Saved.");
      programs.reload();
    } catch (err) {
      setRunError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    if (!confirmDiscard()) return;
    setSource(baseSource);
    setResult(null);
    setRunError(null);
    setNotice(null);
  }

  function loadExample(example: ExampleProgram) {
    if (!confirmDiscard()) return;
    setSource(example.source);
    setBaseSource(example.source);
    setProgramId(null);
    setTitle(null);
    setResult(null);
    setRunError(null);
    setNotice(null);
  }

  function openProgram(id: string) {
    if (id === programId || !confirmDiscard()) return;
    navigate(`/app/compiler?program=${encodeURIComponent(id)}`);
  }

  return (
    <div className="flex flex-col lg:h-[calc(100vh-4rem)]">
      <div className="grid min-h-0 flex-1 gap-3 p-3 lg:grid-cols-[13rem_minmax(0,1fr)_minmax(0,1fr)]">
        <WorkspaceLeftPanel
          examples={EXAMPLES}
          programs={programs}
          currentProgramId={programId}
          onExample={loadExample}
          onProgram={openProgram}
        />

        <section
          aria-label="Code editor"
          className="flex min-h-[26rem] min-w-0 flex-col rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 p-2 dark:border-slate-700">
            <Button onClick={run} disabled={running} className="flex items-center gap-1.5">
              <Play size={15} /> {running ? "Running..." : "Run"}
            </Button>
            <Button
              variant="secondary"
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1.5"
            >
              <Save size={15} /> Save
            </Button>
            <Button
              variant="secondary"
              onClick={reset}
              disabled={!dirty}
              className="flex items-center gap-1.5"
            >
              <RotateCcw size={15} /> Reset
            </Button>
            <span className="ml-auto truncate text-sm text-slate-500 dark:text-slate-400">
              {title ?? "Unsaved program"}
              {dirty ? " *" : ""}
            </span>
          </div>

          {notice && (
            <p role="status" className="px-3 pt-2 text-sm text-green-700 dark:text-green-400">
              {notice}
            </p>
          )}
          {runError && (
            <div className="p-2">
              <ErrorMessage message={runError} />
            </div>
          )}

          <div className="min-h-0 flex-1">
            <CodeEditor value={source} onChange={setSource} diagnostics={diagnostics} onRun={run} />
          </div>
          <p className="shrink-0 border-t border-slate-200 px-3 py-1.5 text-xs text-slate-500 dark:border-slate-700">
            Ctrl+Enter runs the program. Programs are analyzed, never executed.
          </p>
        </section>

        <div className="min-h-[24rem] min-w-0 lg:min-h-0">
          <WorkspaceRightPanel result={result} stale={stale} running={running} runError={null} />
        </div>
      </div>
    </div>
  );
}

// Loads the saved program named in ?program=ID (if any), then shows the workspace.
// The key remounts the workspace when a different program is opened.
export default function CompilerWorkspacePage() {
  const [params] = useSearchParams();
  const programId = params.get("program");

  const fetched = useFetch<Program | null>(
    () => (programId ? fetchProgram(programId) : Promise.resolve(null)),
    `workspace-${programId ?? "new"}`,
  );

  return (
    <PageState loading={fetched.loading} error={fetched.error} onRetry={fetched.reload}>
      <Workspace key={programId ?? "new"} initial={fetched.data} />
    </PageState>
  );
}
