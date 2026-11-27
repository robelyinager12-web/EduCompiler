import { BookOpen, Code, FolderOpen, ListChecks, Send, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import PageState from "../../components/common/PageState";
import StatCard from "../../components/dashboard/StatCard";
import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
import { fetchStats } from "../../services/adminService";

const links = [
  { to: "/admin/students", label: "Manage students" },
  { to: "/admin/lessons", label: "Manage lessons" },
  { to: "/admin/exercises", label: "Manage exercises" },
  { to: "/admin/stats", label: "View statistics" },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const stats = useFetch(fetchStats, "admin-stats");
  const s = stats.data;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-slate-600 dark:text-slate-300">System overview and content management.</p>
      </div>

      <PageState loading={stats.loading} error={stats.error} onRetry={stats.reload}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={Users} label="Students" value={s?.students ?? 0} />
          <StatCard icon={FolderOpen} label="Saved programs" value={s?.programs ?? 0} />
          <StatCard icon={Code} label="Compilations" value={s?.compilations ?? 0} />
          <StatCard icon={BookOpen} label="Lessons" value={s?.lessons ?? 0} />
          <StatCard icon={ListChecks} label="Exercises" value={s?.exercises ?? 0} />
          <StatCard icon={Send} label="Submissions" value={s?.submissions ?? 0} />
        </div>
      </PageState>

      <Card title="Quick actions">
        <ul className="grid gap-2 sm:grid-cols-2">
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="block rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/40"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
