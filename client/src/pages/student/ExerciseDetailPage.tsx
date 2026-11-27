import { Link, useParams } from "react-router-dom";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import CodeBlock from "../../components/common/CodeBlock";
import DifficultyBadge from "../../components/common/DifficultyBadge";
import PageState from "../../components/common/PageState";
import { useFetch } from "../../hooks/useFetch";
import { fetchExercise } from "../../services/exerciseService";
import { fetchProgress } from "../../services/lessonService";

export default function ExerciseDetailPage() {
  const { id = "" } = useParams();
  const exercise = useFetch(() => fetchExercise(id), `exercise-${id}`);
  const progress = useFetch(fetchProgress, `progress-exercise-${id}`);
  const passed = progress.data?.completedExerciseIds.includes(id) ?? false;

  return (
    <div className="space-y-4 p-6">
      <Link to="/app/exercises" className="text-sm text-indigo-600 hover:underline">
        Back to exercises
      </Link>

      <PageState loading={exercise.loading} error={exercise.error} onRetry={exercise.reload}>
        {exercise.data && (
          <>
            <Card>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <DifficultyBadge difficulty={exercise.data.difficulty} />
                {passed && <Badge tone="green">Passed</Badge>}
              </div>
              <h1 className="text-2xl font-bold">{exercise.data.title}</h1>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{exercise.data.description}</p>
              <h2 className="mt-6 font-semibold">Instructions</h2>
              <div className="mt-2 whitespace-pre-wrap leading-relaxed">
                {exercise.data.instructions}
              </div>
            </Card>

            <Card title="Starter code">
              <CodeBlock code={exercise.data.starterCode} label="Starter code" />
              <Link
                to={`/app/compiler?exercise=${encodeURIComponent(id)}`}
                className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {passed ? "Open in the compiler again" : "Solve in the compiler"}
              </Link>
            </Card>
          </>
        )}
      </PageState>
    </div>
  );
}
