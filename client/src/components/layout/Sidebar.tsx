import type { LucideIcon } from "lucide-react";
import { GraduationCap, X } from "lucide-react";
import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";

export type SidebarLink = { to: string; label: string; icon: LucideIcon; end?: boolean };

interface Props {
  links: SidebarLink[];
  subtitle: string;
  mobileOpen: boolean;
  onClose: () => void;
}

function Brand() {
  return (
    <Link to="/" className="flex h-16 items-center gap-2 px-5 text-lg font-bold">
      <GraduationCap className="text-indigo-600" /> EduCompiler
    </Link>
  );
}

function NavList({ links, onNavigate }: { links: SidebarLink[]; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-3" aria-label="Main">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
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
  );
}

export default function Sidebar({ links, subtitle, mobileOpen, onClose }: Props) {
  // Escape closes the drawer.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, onClose]);

  return (
    <>
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex dark:border-slate-700 dark:bg-slate-800">
        <Brand />
        <p className="px-5 pb-2 text-xs uppercase tracking-wide text-slate-400">{subtitle}</p>
        <NavList links={links} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          <aside className="relative flex h-full w-64 flex-col bg-white shadow-xl dark:bg-slate-800">
            <button
              aria-label="Close menu"
              onClick={onClose}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X size={18} />
            </button>
            <Brand />
            <p className="px-5 pb-2 text-xs uppercase tracking-wide text-slate-400">{subtitle}</p>
            <NavList links={links} onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
