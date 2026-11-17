import type { LucideIcon } from "lucide-react";
import { GraduationCap } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

export type SidebarLink = { to: string; label: string; icon: LucideIcon; end?: boolean };

type Props = { links: SidebarLink[]; subtitle: string };

export default function Sidebar({ links, subtitle }: Props) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex dark:border-slate-700 dark:bg-slate-800">
      <Link to="/" className="flex h-16 items-center gap-2 px-5 text-lg font-bold">
        <GraduationCap className="text-indigo-600" /> EduCompiler
      </Link>
      <p className="px-5 pb-2 text-xs uppercase tracking-wide text-slate-400">
        {subtitle}
      </p>
      <nav className="flex flex-col gap-1 px-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                isActive
                  ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              }`
            }
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
