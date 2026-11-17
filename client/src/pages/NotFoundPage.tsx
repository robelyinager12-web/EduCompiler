import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <h1 className="text-5xl font-bold">404</h1>
      <p>This page does not exist.</p>
      <Link to="/" className="text-indigo-600 hover:underline">
        Back to home
      </Link>
    </main>
  );
}
