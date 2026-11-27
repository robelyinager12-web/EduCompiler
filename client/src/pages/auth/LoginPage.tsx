import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import ErrorMessage from "../../components/common/ErrorMessage";
import Input from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../services/api";

export default function LoginPage() {
  const { login, user, status } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already logged in (or just logged in): go to the page they wanted.
  if (status === "authenticated" && user) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? (user.role === "ADMIN" ? "/admin" : "/app")} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <Card title="Log in to EduCompiler" className="mt-10">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && <ErrorMessage message={error} />}
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={submitting || !email || !password} className="w-full">
            {submitting ? "Logging in..." : "Log in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
          No account yet?{" "}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Register
          </Link>
        </p>
      </Card>
    </main>
  );
}
