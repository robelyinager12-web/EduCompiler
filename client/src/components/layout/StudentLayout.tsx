import { BookOpen, Code, FolderOpen, History, LayoutDashboard, ListChecks, User } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar, { type SidebarLink } from "./Sidebar";
import Topbar from "./Topbar";

const links: SidebarLink[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/compiler", label: "Compiler", icon: Code },
  { to: "/app/lessons", label: "Lessons", icon: BookOpen },
  { to: "/app/exercises", label: "Exercises", icon: ListChecks },
  { to: "/app/programs", label: "Saved programs", icon: FolderOpen },
  { to: "/app/history", label: "History", icon: History },
  { to: "/app/profile", label: "Profile", icon: User },
];

export default function StudentLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <Sidebar
        links={links}
        subtitle="Student"
        mobileOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title="Student area" onMenuClick={() => setMenuOpen(true)} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
