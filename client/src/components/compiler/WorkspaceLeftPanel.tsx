import type { ProgramSummary } from "../../types/program.types";
import type { ExampleProgram } from "../../utils/examplePrograms";

interface Props {
  examples: ExampleProgram[];
  programs: { loading: boolean; error: string | null; data: ProgramSummary[] | null };
  currentProgramId: string | null;
  onExample: (example: ExampleProgram) => void;
  onProgram: (id: string) => void;
}

const item =
  "w-full truncate rounded-lg px-3 py-1.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700";

export default function WorkspaceLeftPanel({
  examples,
  programs,
  currentProgramId,
  onExample,
  onProgram,
}: Props) {
  return (
    <aside className="min-h-0 space-y-4 overflow-auto rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
      <section aria-label="Examples">
        <h2 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Examples
        </h2>
        <ul>
          {examples.map((ex) => (
            <li key={ex.id}>
              <button className={item} onClick={() => onExample(ex)}>
                {ex.title}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Saved programs">
        <h2 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          My programs
        </h2>
        {programs.loading && <p className="px-3 text-sm text-slate-500">Loading...</p>}
        {programs.error && <p className="px-3 text-sm text-red-600">{programs.error}</p>}
        {!programs.loading && !programs.error && (programs.data ?? []).length === 0 && (
          <p className="px-3 text-sm text-slate-500">Nothing saved yet.</p>
        )}
        <ul>
          {(programs.data ?? []).map((p) => (
            <li key={p.id}>
              <button
                className={`${item} ${p.id === currentProgramId ? "bg-indigo-50 font-semibold dark:bg-indigo-950" : ""}`}
                onClick={() => onProgram(p.id)}
              >
                {p.title}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
