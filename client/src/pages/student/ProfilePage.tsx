import Card from "../../components/common/Card";
import PageState from "../../components/common/PageState";
import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
import { fetchProgress } from "../../services/lessonService";

export default function ProfilePage() {
  const { user } = useAuth();
  const progress = useFetch(fetchProgress, "progress-profile");

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card title="Account">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Name</dt>
            <dd className="font-medium">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Email</dt>
            <dd className="font-medium">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Role</dt>
            <dd className="font-medium">{user?.role === "ADMIN" ? "Administrator" : "Student"}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Your activity">
        <PageState loading={progress.loading} error={progress.error} onRetry={progress.reload}>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Saved programs</dt>
              <dd className="text-xl font-bold">{progress.data?.programs ?? 0}</dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Recent compilations</dt>
              <dd className="text-xl font-bold">{progress.data?.compilations ?? 0}</dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Lessons completed</dt>
              <dd className="text-xl font-bold">
                {progress.data?.completedLessonIds.length ?? 0}/{progress.data?.totalLessons ?? 0}
              </dd>
            </div>
          </dl>
        </PageState>
      </Card>
    </div>
  );
}
