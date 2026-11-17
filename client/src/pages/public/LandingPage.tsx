import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import ErrorMessage from "../../components/common/ErrorMessage";
import Loader from "../../components/common/Loader";
import { api } from "../../services/api";

type HealthResponse = {
  status: string;
  service: string;
  timestamp: string;
};

type ApiState = "loading" | "online" | "offline";

export default function LandingPage() {
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

      <div className="mt-6 flex gap-4 text-sm">
        <Link to="/app" className="text-indigo-600 hover:underline">
          Student area (preview)
        </Link>
        <Link to="/admin" className="text-indigo-600 hover:underline">
          Admin area (preview)
        </Link>
      </div>

      <Card title="Backend connection" className="mt-8">
        {apiState === "loading" && <Loader label="Checking server..." />}
        {apiState === "online" && health && (
          <p className="text-green-700 dark:text-green-400">
            Connected: {health.service} ({health.status})
          </p>
        )}
        {apiState === "offline" && (
          <ErrorMessage message="Cannot reach the server. Is the backend running on port 5000?" />
        )}
      </Card>
    </main>
  );
}
