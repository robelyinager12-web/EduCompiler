import { BookOpen, Code, FolderOpen, Play } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import PageState from "../../components/common/PageState";
import ProgressBar from "../../components/dashboard/ProgressBar";
import RecentActivity from "../../components/dashboard/RecentActivity";
import StatCard from "../../components/dashboard/StatCard";
import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
import { fetchHistory } from "../../services/compilerService";
import { fetchProgress } from "../../services/lessonService";

export default function DashboardPage() {
  const { user } = useAuth();
  const progress = useFetch(fetchProgress, "progress");
  const recent = useFetch(() => fetchHistory(1, 5), "recent-runs");

  const completed = progress.data?.completedLessonIds.length ?? 0;
  const totalLessons = progress.data?.totalLessons ?? 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name}</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Write a program, run the compiler, and see every phase.
          </p>
        </div>
        <Link
          to="/app/compiler"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Play size={16} /> Open the compiler
        </Link>
      </div>

      <PageState loading={progress.loading} error={progress.error} onRetry={progress.reload}>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={FolderOpen} label="Saved programs" value={progress.data?.programs ?? 0} />
          <StatCard icon={Code} label="Recent compilations" value={progress.data?.compilations ?? 0} />
          <StatCard icon={BookOpen} label="Lessons completed" value={`${completed}/${totalLessons}`} />
        </div>

        <Card title="Learning progress">
          <ProgressBar value={completed} max={totalLessons} label="Lessons" />
          <Link to="/app/lessons" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
            Continue learning
          </Link>
        </Card>
      </PageState>

      <Card title="Recent compilation activity">
        <PageState loading={recent.loading} error={recent.error} onRetry={recent.reload}>
          <RecentActivity runs={recent.data?.items ?? []} />
          {(recent.data?.total ?? 0) > 0 && (
            <Link to="/app/history" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
              View all history
            </Link>
          )}
        </PageState>
      </Card>
    </div>
  );
}
