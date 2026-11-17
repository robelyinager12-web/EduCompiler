import { GraduationCap } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import ThemeToggle from "../common/ThemeToggle";

const links = [
  { to: "/about", label: "About" },
  { to: "/features", label: "Features" },
  { to: "/login", label: "Log in" },
  { to: "/register", label: "Register" },
];

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <GraduationCap className="text-indigo-600" /> EduCompiler
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive ? "font-semibold text-indigo-600" : "hover:text-indigo-600"
                }
              >
                {link.label}
              </NavLink>
            ))}
            <ThemeToggle />
          </div>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
