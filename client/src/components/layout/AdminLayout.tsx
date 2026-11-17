import { Activity, BookOpen, LayoutDashboard, ListChecks, Users } from "lucide-react";
import { Outlet } from "react-router-dom";
import Sidebar, { type SidebarLink } from "./Sidebar";
import Topbar from "./Topbar";

const links: SidebarLink[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/lessons", label: "Lessons", icon: BookOpen },
  { to: "/admin/exercises", label: "Exercises", icon: ListChecks },
  { to: "/admin/stats", label: "Statistics", icon: Activity },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <Sidebar links={links} subtitle="Administrator" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title="Admin area" />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
