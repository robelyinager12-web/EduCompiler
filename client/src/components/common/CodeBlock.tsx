// Code is shown as text, never as HTML.
export default function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <pre
      aria-label={label}
      className="overflow-x-auto rounded-lg bg-slate-100 p-3 font-mono text-sm text-slate-800 dark:bg-slate-900 dark:text-slate-100"
    >
      {code === "" ? "(empty)" : code}
    </pre>
  );
}
