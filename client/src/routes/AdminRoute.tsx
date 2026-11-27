import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loader from "../components/common/Loader";
import { useAuth } from "../hooks/useAuth";

// Wraps the admin area. The server enforces this too; this only avoids showing
// admin screens to a student.
export default function AdminRoute() {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader label="Checking your session..." />
      </div>
    );
  }
  if (status === "anonymous" || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (user.role !== "ADMIN") {
    return <Navigate to="/app" replace />;
  }
  return <Outlet />;
}
