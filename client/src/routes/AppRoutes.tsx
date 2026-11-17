import { Route, Routes } from "react-router-dom";
import PlaceholderPage from "../components/common/PlaceholderPage";
import AdminLayout from "../components/layout/AdminLayout";
import PublicLayout from "../components/layout/PublicLayout";
import StudentLayout from "../components/layout/StudentLayout";
import LandingPage from "../pages/public/LandingPage";
import NotFoundPage from "../pages/NotFoundPage";

// Login protection (ProtectedRoute, AdminRoute) is added in Phase 13.
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<PlaceholderPage title="About EduCompiler" />} />
        <Route path="/features" element={<PlaceholderPage title="Compiler features" />} />
        <Route path="/login" element={<PlaceholderPage title="Log in" />} />
        <Route path="/register" element={<PlaceholderPage title="Register" />} />
      </Route>

      <Route path="/app" element={<StudentLayout />}>
        <Route index element={<PlaceholderPage title="Student dashboard" />} />
        <Route path="compiler" element={<PlaceholderPage title="Compiler workspace" />} />
        <Route path="lessons" element={<PlaceholderPage title="Lessons" />} />
        <Route path="exercises" element={<PlaceholderPage title="Exercises" />} />
        <Route path="programs" element={<PlaceholderPage title="Saved programs" />} />
        <Route path="history" element={<PlaceholderPage title="Compilation history" />} />
        <Route path="profile" element={<PlaceholderPage title="Profile" />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<PlaceholderPage title="Admin dashboard" />} />
        <Route path="students" element={<PlaceholderPage title="Student management" />} />
        <Route path="lessons" element={<PlaceholderPage title="Lesson management" />} />
        <Route
          path="exercises"
          element={<PlaceholderPage title="Exercise management" />}
        />
        <Route path="stats" element={<PlaceholderPage title="System statistics" />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
