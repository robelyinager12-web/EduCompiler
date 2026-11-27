import ThemeToggle from "../common/ThemeToggle";
import ProfileMenu from "./ProfileMenu";

export default function Topbar({ title }: { title: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-700 dark:bg-slate-800">
      <span className="font-semibold">{title}</span>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  );
}
