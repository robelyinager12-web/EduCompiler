import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import DifficultyBadge from "../../components/common/DifficultyBadge";
import ErrorMessage from "../../components/common/ErrorMessage";
import PageState from "../../components/common/PageState";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../services/api";
import { fetchLesson, fetchProgress, setLessonCompleted } from "../../services/lessonService";

export default function LessonDetailPage() {
  const { id = "" } = useParams();
  const lesson = useFetch(() => fetchLesson(id), `lesson-${id}`);
  const progress = useFetch(fetchProgress, `progress-lesson-${id}`);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isDone = progress.data?.completedLessonIds.includes(id) ?? false;

  async function toggle() {
    setActionError(null);
    setSaving(true);
    try {
      await setLessonCompleted(id, !isDone);
      progress.reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 p-6">
      <Link to="/app/lessons" className="text-sm text-indigo-600 hover:underline">
        Back to lessons
      </Link>

      <PageState loading={lesson.loading} error={lesson.error} onRetry={lesson.reload}>
        {lesson.data && (
          <Card>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {lesson.data.category}
              </span>
              <DifficultyBadge difficulty={lesson.data.difficulty} />
            </div>
            <h1 className="text-2xl font-bold">{lesson.data.title}</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-300">{lesson.data.description}</p>

            {/* Plain text only. Lesson content is never rendered as HTML. */}
            <div className="mt-6 whitespace-pre-wrap leading-relaxed">{lesson.data.content}</div>

            <div className="mt-8 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
              {actionError && <ErrorMessage message={actionError} />}
              <Button
                variant={isDone ? "secondary" : "primary"}
                disabled={saving || progress.loading}
                onClick={toggle}
              >
                {isDone ? "Mark as not completed" : "Mark as completed"}
              </Button>
            </div>
          </Card>
        )}
      </PageState>
    </div>
  );
}
