import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageState from "../../components/common/PageState";
import RunStatusBadge from "../../components/common/RunStatusBadge";
import { useFetch } from "../../hooks/useFetch";
import { fetchHistory } from "../../services/compilerService";
import { formatDate, previewSource } from "../../utils/formatDate";

const PAGE_SIZE = 10;

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const history = useFetch(() => fetchHistory(page, PAGE_SIZE), `history-${page}`);

  const total = history.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Compilation history</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        The newest 200 compilations are kept.
      </p>

      <PageState loading={history.loading} error={history.error} onRetry={history.reload}>
        {(history.data?.items ?? []).length === 0 ? (
          <Card>
            <p className="text-slate-600 dark:text-slate-300">
              No compilations yet. They appear here when you compile while logged in.
            </p>
          </Card>
        ) : (
          <>
            <Card className="!p-0">
              <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {(history.data?.items ?? []).map((run) => (
                  <li key={run.id}>
                    <Link
                      to={`/app/history/${run.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-mono text-sm">
                          {previewSource(run.sourceCode)}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(run.createdAt)}
                        </span>
                      </span>
                      <RunStatusBadge status={run.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>

            <div className="flex items-center justify-between">
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Page {page} of {pages}
              </span>
              <Button
                variant="secondary"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </PageState>
    </div>
  );
}
