import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import LessonForm from "../../components/admin/LessonForm";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import DifficultyBadge from "../../components/common/DifficultyBadge";
import ErrorMessage from "../../components/common/ErrorMessage";
import PageState from "../../components/common/PageState";
import { useFetch } from "../../hooks/useFetch";
import { createLesson, deleteLesson, updateLesson } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import { fetchLesson, fetchLessons } from "../../services/lessonService";
import type { LessonInput } from "../../types/admin.types";
import type { Lesson } from "../../types/learning.types";

type Mode = { kind: "list" } | { kind: "form"; id: string | null };

interface EditorProps {
  id: string | null;
  onDone: () => void;
  onCancel: () => void;
}

// The list has no lesson text, so editing loads the full lesson first.
function LessonEditor({ id, onDone, onCancel }: EditorProps) {
  const existing = useFetch<Lesson | null>(
    () => (id ? fetchLesson(id) : Promise.resolve(null)),
    `admin-lesson-${id ?? "new"}`,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: LessonInput) {
    setSubmitting(true);
    setError(null);
    try {
      if (id) await updateLesson(id, values);
      else await createLesson(values);
      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <PageState loading={existing.loading} error={existing.error} onRetry={existing.reload}>
      <Card title={id ? "Edit lesson" : "New lesson"}>
        <LessonForm
          initial={existing.data}
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      </Card>
    </PageState>
  );
}

export default function LessonManagementPage() {
  const lessons = useFetch(fetchLessons, "admin-lessons");
  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete the lesson "${title}"? Students' completion records for it are removed too.`)) {
      return;
    }
    setActionError(null);
    setDeletingId(id);
    try {
      await deleteLesson(id);
      lessons.reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  if (mode.kind === "form") {
    return (
      <div className="p-6">
        <LessonEditor
          key={mode.id ?? "new"}
          id={mode.id}
          onCancel={() => setMode({ kind: "list" })}
          onDone={() => {
            setMode({ kind: "list" });
            lessons.reload();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lesson management</h1>
        <Button onClick={() => setMode({ kind: "form", id: null })} className="flex items-center gap-1.5">
          <Plus size={16} /> New lesson
        </Button>
      </div>
      {actionError && <ErrorMessage message={actionError} />}

      <PageState loading={lessons.loading} error={lessons.error} onRetry={lessons.reload}>
        {(lessons.data ?? []).length === 0 ? (
          <Card>
            <p className="text-slate-600 dark:text-slate-300">No lessons yet. Create the first one.</p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {(lessons.data ?? []).map((lesson) => (
              <li key={lesson.id}>
                <Card className="flex items-center justify-between gap-4 !p-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{lesson.title}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      {lesson.category} <DifficultyBadge difficulty={lesson.difficulty} />
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="secondary"
                      aria-label={`Edit ${lesson.title}`}
                      onClick={() => setMode({ kind: "form", id: lesson.id })}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="secondary"
                      aria-label={`Delete ${lesson.title}`}
                      disabled={deletingId === lesson.id}
                      onClick={() => handleDelete(lesson.id, lesson.title)}
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
