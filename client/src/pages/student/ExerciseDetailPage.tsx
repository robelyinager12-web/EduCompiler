import { Link, useParams } from "react-router-dom";
import Card from "../../components/common/Card";
import CodeBlock from "../../components/common/CodeBlock";
import DifficultyBadge from "../../components/common/DifficultyBadge";
import PageState from "../../components/common/PageState";
import { useFetch } from "../../hooks/useFetch";
import { fetchExercise } from "../../services/exerciseService";

export default function ExerciseDetailPage() {
  const { id = "" } = useParams();
  const exercise = useFetch(() => fetchExercise(id), `exercise-${id}`);

  return (
    <div className="space-y-4 p-6">
      <Link to="/app/exercises" className="text-sm text-indigo-600 hover:underline">
        Back to exercises
      </Link>

      <PageState loading={exercise.loading} error={exercise.error} onRetry={exercise.reload}>
        {exercise.data && (
          <>
            <Card>
              <div className="mb-2">
                <DifficultyBadge difficulty={exercise.data.difficulty} />
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
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Solving and submitting exercises in the compiler workspace is added in the next
                parts.
              </p>
            </Card>
          </>
        )}
      </PageState>
    </div>
  );
}
