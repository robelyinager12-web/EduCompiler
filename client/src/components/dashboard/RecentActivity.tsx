import { Link } from "react-router-dom";
import type { RunSummary } from "../../types/compiler.types";
import { formatDate, previewSource } from "../../utils/formatDate";
import RunStatusBadge from "../common/RunStatusBadge";

export default function RecentActivity({ runs }: { runs: RunSummary[] }) {
  if (runs.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        No compilations yet. Open the compiler and run your first program.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
      {runs.map((run) => (
        <li key={run.id}>
          <Link
            to={`/app/history/${run.id}`}
            className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/40"
          >
            <span className="min-w-0">
              <span className="block truncate font-mono text-sm">{previewSource(run.sourceCode)}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {formatDate(run.createdAt)}
              </span>
            </span>
            <RunStatusBadge status={run.status} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
