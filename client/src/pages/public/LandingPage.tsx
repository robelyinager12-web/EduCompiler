import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import ErrorMessage from "../../components/common/ErrorMessage";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../services/api";

type HealthResponse = {
  status: string;
  service: string;
  database?: string;
  timestamp: string;
};

type ApiState = "loading" | "online" | "offline";

export default function LandingPage() {
  const { status } = useAuth();
  const [apiState, setApiState] = useState<ApiState>("loading");
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    api
      .get<HealthResponse>("/health")
      .then((response) => {
        setHealth(response.data);
        setApiState("online");
      })
      .catch(() => setApiState("offline"));
  }, []);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mt-8 text-4xl font-bold">EduCompiler</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        Interactive Compiler Learning and Visualization System
      </p>

      {status === "anonymous" && (
        <div className="mt-6 flex gap-3">
          <Link
            to="/register"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Create account
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Log in
          </Link>
        </div>
      )}

      <Card title="Backend connection" className="mt-8">
        {apiState === "loading" && <Loader label="Checking server..." />}
        {apiState === "online" && health && (
          <p className="text-green-700 dark:text-green-400">
            Connected: {health.service} ({health.status})
            {health.database ? `, database ${health.database}` : ""}
          </p>
        )}
        {apiState === "offline" && (
          <ErrorMessage message="Cannot reach the server. Is the backend running on port 5000?" />
        )}
      </Card>
    </main>
  );
}
