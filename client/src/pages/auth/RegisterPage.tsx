import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import ErrorMessage from "../../components/common/ErrorMessage";
import Input from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../services/api";

export default function RegisterPage() {
  const { register, user, status } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated" && user) {
    return <Navigate to={user.role === "ADMIN" ? "/admin" : "/app"} replace />;
  }

  // Same limits as the server (8 to 72 characters). The server checks again.
  const passwordError =
    password.length > 0 && password.length < 8
      ? "Use at least 8 characters."
      : password.length > 72
        ? "Use at most 72 characters."
        : undefined;
  const confirmError =
    confirm.length > 0 && confirm !== password ? "Passwords do not match." : undefined;
  const canSubmit =
    name.trim() && email.trim() && password.length >= 8 && !passwordError && confirm === password;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <Card title="Create your student account" className="mt-10">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && <ErrorMessage message={error} />}
          <Input
            label="Full name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
          />
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            required
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={confirmError}
            required
          />
          <Button type="submit" disabled={submitting || !canSubmit} className="w-full">
            {submitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
          Already registered?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </main>
  );
}
