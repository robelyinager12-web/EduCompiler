import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export default function Button({ variant = "primary", className = "", ...props }: Props) {
  const styles =
    variant === "primary"
      ? "bg-indigo-600 text-white hover:bg-indigo-700"
      : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800";

  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
  );
}
