import { Menu } from "lucide-react";
import ThemeToggle from "../common/ThemeToggle";
import ProfileMenu from "./ProfileMenu";

interface Props {
  title: string;
  onMenuClick?: () => void;
}

export default function Topbar({ title, onMenuClick }: Props) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800 md:px-6">
      <div className="flex items-center gap-2">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Menu size={20} />
          </button>
        )}
        <span className="font-semibold">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  );
}
