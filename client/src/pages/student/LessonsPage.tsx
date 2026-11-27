import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import DifficultyBadge from "../../components/common/DifficultyBadge";
import PageState from "../../components/common/PageState";
import { useFetch } from "../../hooks/useFetch";
import { fetchLessons, fetchProgress } from "../../services/lessonService";

export default function LessonsPage() {
  const lessons = useFetch(fetchLessons, "lessons");
  const progress = useFetch(fetchProgress, "progress-lessons");
  const done = new Set(progress.data?.completedLessonIds ?? []);

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Lessons</h1>

      <PageState loading={lessons.loading} error={lessons.error} onRetry={lessons.reload}>
        {(lessons.data ?? []).length === 0 ? (
          <Card>
            <p className="text-slate-600 dark:text-slate-300">No lessons have been published yet.</p>
          </Card>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {(lessons.data ?? []).map((lesson) => (
              <li key={lesson.id}>
                <Link to={`/app/lessons/${lesson.id}`} className="block h-full">
                  <Card className="h-full hover:border-indigo-400">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {lesson.category}
                      </span>
                      {done.has(lesson.id) && (
                        <span className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold">{lesson.title}</h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {lesson.description}
                    </p>
                    <div className="mt-3">
                      <DifficultyBadge difficulty={lesson.difficulty} />
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
