import type { ReactNode } from "react";

type Props = { title?: string; children: ReactNode; className?: string };

export default function Card({ title, children, className = "" }: Props) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}
    >
      {title && <h2 className="mb-3 text-lg font-semibold">{title}</h2>}
      {children}
    </section>
  );
}
