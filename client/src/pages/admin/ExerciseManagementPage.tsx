import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import ExerciseForm from "../../components/admin/ExerciseForm";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import DifficultyBadge from "../../components/common/DifficultyBadge";
import ErrorMessage from "../../components/common/ErrorMessage";
import PageState from "../../components/common/PageState";
import { useFetch } from "../../hooks/useFetch";
import {
  createExercise,
  deleteExercise,
  fetchAdminExercises,
  updateExercise,
} from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import type { AdminExercise, ExerciseInput } from "../../types/admin.types";

type Mode = { kind: "list" } | { kind: "form"; exercise: AdminExercise | null };

interface EditorProps {
  exercise: AdminExercise | null;
  onDone: () => void;
  onCancel: () => void;
}

function ExerciseEditor({ exercise, onDone, onCancel }: EditorProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: ExerciseInput) {
    setSubmitting(true);
    setError(null);
    try {
      if (exercise) await updateExercise(exercise.id, values);
      else await createExercise(values);
      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <Card title={exercise ? "Edit exercise" : "New exercise"}>
      <ExerciseForm
        initial={exercise}
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </Card>
  );
}

export default function ExerciseManagementPage() {
  const exercises = useFetch(fetchAdminExercises, "admin-exercises");
  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete the exercise "${title}"? Student submissions for it are removed too.`)) {
      return;
    }
    setActionError(null);
    setDeletingId(id);
    try {
      await deleteExercise(id);
      exercises.reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  if (mode.kind === "form") {
    return (
      <div className="p-6">
        <ExerciseEditor
          key={mode.exercise?.id ?? "new"}
          exercise={mode.exercise}
          onCancel={() => setMode({ kind: "list" })}
          onDone={() => {
            setMode({ kind: "list" });
            exercises.reload();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exercise management</h1>
        <Button onClick={() => setMode({ kind: "form", exercise: null })} className="flex items-center gap-1.5">
          <Plus size={16} /> New exercise
        </Button>
      </div>
      {actionError && <ErrorMessage message={actionError} />}

      <PageState loading={exercises.loading} error={exercises.error} onRetry={exercises.reload}>
        {(exercises.data ?? []).length === 0 ? (
          <Card>
            <p className="text-slate-600 dark:text-slate-300">No exercises yet. Create the first one.</p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {(exercises.data ?? []).map((exercise) => (
              <li key={exercise.id}>
                <Card className="flex items-center justify-between gap-4 !p-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{exercise.title}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      Answer key: {exercise.expectedConcept}{" "}
                      <DifficultyBadge difficulty={exercise.difficulty} />
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="secondary"
                      aria-label={`Edit ${exercise.title}`}
                      onClick={() => setMode({ kind: "form", exercise })}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="secondary"
                      aria-label={`Delete ${exercise.title}`}
                      disabled={deletingId === exercise.id}
                      onClick={() => handleDelete(exercise.id, exercise.title)}
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
