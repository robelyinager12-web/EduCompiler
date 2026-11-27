import { GraduationCap } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ThemeToggle from "../common/ThemeToggle";

const publicLinks = [
  { to: "/about", label: "About" },
  { to: "/features", label: "Features" },
];

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "font-semibold text-indigo-600" : "hover:text-indigo-600";

export default function PublicLayout() {
  const { user, status } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <GraduationCap className="text-indigo-600" /> EduCompiler
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {publicLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={navClass}>
                {link.label}
              </NavLink>
            ))}

            {status === "authenticated" && user && (
              <Link
                to={user.role === "ADMIN" ? "/admin" : "/app"}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
              >
                Open app
              </Link>
            )}
            {status === "anonymous" && (
              <>
                <NavLink to="/login" className={navClass}>
                  Log in
                </NavLink>
                <NavLink to="/register" className={navClass}>
                  Register
                </NavLink>
              </>
            )}
            <ThemeToggle />
          </div>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
