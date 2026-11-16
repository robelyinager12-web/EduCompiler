import { useEffect, useState } from "react";
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
    <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold">EduCompiler</h1>
        <p className="mt-2 text-slate-600">
          Interactive Compiler Learning and Visualization System
        </p>

        <div className="mt-6 rounded-lg border p-4">
          <h2 className="font-semibold">Backend connection</h2>

          {apiState === "loading" && (
            <p className="mt-2 text-slate-500">Checking server...</p>
          )}

          {apiState === "online" && health && (
            <p className="mt-2 text-green-700">
              Connected: {health.service} ({health.status})
            </p>
          )}

          {apiState === "offline" && (
            <p className="mt-2 text-red-600">
              Cannot reach the server. Is the backend running on port 5000?
            </p>
          )}
        </div>
      </div>
    </main>
  );
}