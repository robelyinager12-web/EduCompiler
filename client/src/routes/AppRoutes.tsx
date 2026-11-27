import { Route, Routes } from "react-router-dom";
import PlaceholderPage from "../components/common/PlaceholderPage";
import AdminLayout from "../components/layout/AdminLayout";
import PublicLayout from "../components/layout/PublicLayout";
import StudentLayout from "../components/layout/StudentLayout";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import NotFoundPage from "../pages/NotFoundPage";
import LandingPage from "../pages/public/LandingPage";
import CompilerWorkspacePage from "../pages/student/CompilerWorkspacePage";
import DashboardPage from "../pages/student/DashboardPage";
import ExerciseDetailPage from "../pages/student/ExerciseDetailPage";
import ExercisesPage from "../pages/student/ExercisesPage";
import HistoryDetailPage from "../pages/student/HistoryDetailPage";
import HistoryPage from "../pages/student/HistoryPage";
import LessonDetailPage from "../pages/student/LessonDetailPage";
import LessonsPage from "../pages/student/LessonsPage";
import ProfilePage from "../pages/student/ProfilePage";
import SavedProgramsPage from "../pages/student/SavedProgramsPage";
import AdminRoute from "./AdminRoute";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<PlaceholderPage title="About EduCompiler" />} />
        <Route path="/features" element={<PlaceholderPage title="Compiler features" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Any logged-in user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<StudentLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="compiler" element={<CompilerWorkspacePage />} />
          <Route path="lessons" element={<LessonsPage />} />
          <Route path="lessons/:id" element={<LessonDetailPage />} />
          <Route path="exercises" element={<ExercisesPage />} />
          <Route path="exercises/:id" element={<ExerciseDetailPage />} />
          <Route path="programs" element={<SavedProgramsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="history/:id" element={<HistoryDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Administrators only */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<PlaceholderPage title="Admin dashboard" />} />
          <Route path="students" element={<PlaceholderPage title="Student management" />} />
          <Route path="lessons" element={<PlaceholderPage title="Lesson management" />} />
          <Route path="exercises" element={<PlaceholderPage title="Exercise management" />} />
          <Route path="stats" element={<PlaceholderPage title="System statistics" />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
