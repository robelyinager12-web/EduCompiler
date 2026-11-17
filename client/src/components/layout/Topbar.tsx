import { User } from "lucide-react";
import ThemeToggle from "../common/ThemeToggle";

export default function Topbar({ title }: { title: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-700 dark:bg-slate-800">
      <span className="font-semibold">{title}</span>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {/* Real profile menu and logout come in Phase 13 */}
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          <User size={18} />
        </span>
      </div>
    </header>
  );
}
