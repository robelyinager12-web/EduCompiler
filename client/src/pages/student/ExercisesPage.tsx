import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import DifficultyBadge from "../../components/common/DifficultyBadge";
import PageState from "../../components/common/PageState";
import { useFetch } from "../../hooks/useFetch";
import { fetchExercises } from "../../services/exerciseService";
import { fetchProgress } from "../../services/lessonService";

export default function ExercisesPage() {
  const exercises = useFetch(fetchExercises, "exercises");
  const progress = useFetch(fetchProgress, "progress-exercises");
  const done = new Set(progress.data?.completedExerciseIds ?? []);

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Exercises</h1>

      <PageState loading={exercises.loading} error={exercises.error} onRetry={exercises.reload}>
        {(exercises.data ?? []).length === 0 ? (
          <Card>
            <p className="text-slate-600 dark:text-slate-300">
              No exercises have been published yet.
            </p>
          </Card>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {(exercises.data ?? []).map((exercise) => (
              <li key={exercise.id}>
                <Link to={`/app/exercises/${exercise.id}`} className="block h-full">
                  <Card className="h-full hover:border-indigo-400">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-lg font-semibold">{exercise.title}</h2>
                      {done.has(exercise.id) && (
                        <span className="flex shrink-0 items-center gap-1 text-xs text-green-700 dark:text-green-400">
                          <CheckCircle2 size={14} /> Passed
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {exercise.description}
                    </p>
                    <div className="mt-3">
                      <DifficultyBadge difficulty={exercise.difficulty} />
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageState>
    </div>
  );
}
