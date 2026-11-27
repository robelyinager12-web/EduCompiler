import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import ErrorMessage from "../../components/common/ErrorMessage";
import PageState from "../../components/common/PageState";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../services/api";
import { deleteProgram, fetchPrograms } from "../../services/programService";
import { formatDate } from "../../utils/formatDate";

export default function SavedProgramsPage() {
  const programs = useFetch(fetchPrograms, "programs");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setActionError(null);
    setDeletingId(id);
    try {
      await deleteProgram(id);
      programs.reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Saved programs</h1>
        <Link
          to="/app/compiler"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          New program
        </Link>
      </div>

      {actionError && <ErrorMessage message={actionError} />}

      <PageState loading={programs.loading} error={programs.error} onRetry={programs.reload}>
        {(programs.data ?? []).length === 0 ? (
          <Card>
            <p className="text-slate-600 dark:text-slate-300">
              You have no saved programs. Write one in the compiler and press Save.
            </p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {(programs.data ?? []).map((program) => (
              <li key={program.id}>
                <Card className="flex items-center justify-between gap-4 !p-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{program.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Updated {formatDate(program.updatedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      to={`/app/compiler?program=${encodeURIComponent(program.id)}`}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                    >
                      Open
                    </Link>
                    <Button
                      variant="secondary"
                      aria-label={`Delete ${program.title}`}
                      disabled={deletingId === program.id}
                      onClick={() => handleDelete(program.id, program.title)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </PageState>
    </div>
  );
}
