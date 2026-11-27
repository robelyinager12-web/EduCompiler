import Card from "../../components/common/Card";
import PageState from "../../components/common/PageState";
import ProgressBar from "../../components/dashboard/ProgressBar";
import { useFetch } from "../../hooks/useFetch";
import { fetchStats } from "../../services/adminService";

export default function StatisticsPage() {
  const stats = useFetch(fetchStats, "admin-statistics");
  const s = stats.data;

  const rows: [string, number][] = s
    ? [
        ["Students", s.students],
        ["Saved programs", s.programs],
        ["Compilations (kept)", s.compilations],
        ["Successful compilations", s.successfulCompilations],
        ["Failed compilations", s.failedCompilations],
        ["Lessons", s.lessons],
        ["Exercises", s.exercises],
        ["Exercise submissions", s.submissions],
      ]
    : [];

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">System statistics</h1>

      <PageState loading={stats.loading} error={stats.error} onRetry={stats.reload}>
        {s && (
          <>
            <Card title="Compilation success rate">
              <ProgressBar
                value={s.successfulCompilations}
                max={s.compilations}
                label="Successful compilations"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Only the newest 200 compilations per student are kept, so this counts recent runs.
              </p>
            </Card>

            <Card title="All counts">
              <dl className="divide-y divide-slate-200 text-sm dark:divide-slate-700">
                {rows.map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2">
                    <dt className="text-slate-600 dark:text-slate-300">{label}</dt>
                    <dd className="font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </>
        )}
      </PageState>
    </div>
  );
}
